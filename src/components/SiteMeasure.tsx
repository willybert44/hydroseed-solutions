"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, Pencil, RotateCcw, Undo2, X, Check } from "lucide-react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "54d5456fac6b4d0b8a8c5da7";

/* ─── Script loader (importLibrary-based for loading=async) ─── */
let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise;
  if (typeof google !== "undefined" && google.maps?.marker?.AdvancedMarkerElement) {
    return Promise.resolve();
  }

  mapsLoadPromise = (async () => {
    // Add bootstrap script if no Google Maps script exists yet
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Wait for importLibrary to become available (not just google.maps)
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Google Maps load timeout")), 15000);
      const poll = setInterval(() => {
        if (
          typeof google !== "undefined" &&
          google.maps &&
          typeof google.maps.importLibrary === "function"
        ) {
          clearInterval(poll);
          clearTimeout(timeout);
          resolve();
        }
      }, 50);
    });

    // Dynamically load all required libraries
    await Promise.all([
      google.maps.importLibrary("places"),
      google.maps.importLibrary("geometry"),
      google.maps.importLibrary("marker"),
    ]);
  })();

  mapsLoadPromise.catch(() => { mapsLoadPromise = null; });
  return mapsLoadPromise;
}

function computeAreaSqFt(polygon: google.maps.Polygon): number {
  const areaM2 = google.maps.geometry?.spherical.computeArea(polygon.getPath()) ?? 0;
  return Math.round(areaM2 * 10.7639);
}

/* ─── SVG marker helpers ─── */
function createMarkerContent(radius: number, isFirst: boolean): HTMLElement {
  const size = radius * 2;
  const el = document.createElement("div");
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.cursor = isFirst ? "pointer" : "default";
  el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${radius}" cy="${radius}" r="${radius - 1}" fill="#00c898" stroke="#fff" stroke-width="2"/>
  </svg>`;
  return el;
}

interface SiteMeasureProps {
  onAreaMeasured: (sqft: number) => void;
  onClose: () => void;
}

export default function SiteMeasure({ onAreaMeasured, onClose }: Readonly<SiteMeasureProps>) {
  const [apiLoaded, setApiLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointCount, setPointCount] = useState(0);
  const [measuredArea, setMeasuredArea] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pointsRef = useRef<google.maps.LatLng[]>([]);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const polygonListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const moveListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const areaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  /* ─── Cleanup helpers ─── */
  const removeListener = (ref: React.RefObject<google.maps.MapsEventListener | null>) => {
    if (ref.current) {
      google.maps.event.removeListener(ref.current);
      ref.current = null;
    }
  };

  const clearAllMapObjects = useCallback(() => {
    markersRef.current.forEach((m) => { m.map = null; });
    markersRef.current = [];
    if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }
    if (polygonRef.current) { polygonRef.current.setMap(null); polygonRef.current = null; }
    polygonListenersRef.current.forEach((l) => google.maps.event.removeListener(l));
    polygonListenersRef.current = [];
    removeListener(moveListenerRef);
    removeListener(clickListenerRef);
    if (areaTimerRef.current) { clearTimeout(areaTimerRef.current); areaTimerRef.current = null; }
  }, []);

  /* ─── Unmount: tear down everything ─── */
  useEffect(() => {
    return () => {
      if (typeof google !== "undefined" && google.maps) clearAllMapObjects();
    };
  }, [clearAllMapObjects]);

  /* ─── Escape key closes modal ─── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    globalThis.addEventListener("keydown", handleKey);
    return () => globalThis.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* ─── Load API + Autocomplete (on input focus) ─── */
  const pendingPlaceRef = useRef<google.maps.LatLng | null>(null);

  const loadApi = useCallback(async () => {
    if (apiLoaded) return;
    await loadGoogleMaps();
    setApiLoaded(true);
  }, [apiLoaded]);

  useEffect(() => {
    if (!apiLoaded || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["geometry", "formatted_address"],
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;

      if (mapRef.current) {
        // Map already exists — just pan
        mapRef.current.setCenter(loc);
        mapRef.current.setZoom(20);
      } else {
        // First selection — create the map
        pendingPlaceRef.current = loc;
        initMap(loc);
      }
    });

    return () => google.maps.event.removeListener(listener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLoaded]);

  /* ─── Map init (called on first address selection) ─── */
  const initMap = useCallback((center: google.maps.LatLng) => {
    if (!mapContainerRef.current) return;

    const map = new google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 20,
      mapTypeId: "satellite",
      tilt: 0,
      mapId: GOOGLE_MAPS_MAP_ID,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
      draggableCursor: "crosshair",
    });
    mapRef.current = map;
    setMapReady(true);
  }, []);

  /* ─── Debounced area recalculation ─── */
  const scheduleAreaCalc = useCallback((polygon: google.maps.Polygon) => {
    if (areaTimerRef.current) clearTimeout(areaTimerRef.current);
    areaTimerRef.current = setTimeout(() => setMeasuredArea(computeAreaSqFt(polygon)), 30);
  }, []);

  /* ─── Finish drawing → editable polygon ─── */
  const finishDrawing = useCallback(() => {
    if (pointsRef.current.length < 3) return;

    const map = mapRef.current;
    if (!map) return;

    setIsDrawing(false);
    map.setOptions({ draggableCursor: null, draggable: true });

    removeListener(moveListenerRef);
    removeListener(clickListenerRef);
    if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }
    markersRef.current.forEach((m) => { m.map = null; });
    markersRef.current = [];

    const finalPolygon = new google.maps.Polygon({
      paths: pointsRef.current,
      map,
      fillColor: "#00c898",
      fillOpacity: 0.3,
      strokeColor: "#00c898",
      strokeWeight: 2,
      editable: true,
      draggable: true,
    });
    polygonRef.current = finalPolygon;

    setMeasuredArea(computeAreaSqFt(finalPolygon));

    const l1 = google.maps.event.addListener(finalPolygon.getPath(), "set_at", () => scheduleAreaCalc(finalPolygon));
    const l2 = google.maps.event.addListener(finalPolygon.getPath(), "insert_at", () => scheduleAreaCalc(finalPolygon));
    const l3 = google.maps.event.addListener(finalPolygon.getPath(), "remove_at", () => scheduleAreaCalc(finalPolygon));
    polygonListenersRef.current = [l1, l2, l3];
  }, [scheduleAreaCalc]);

  /* ─── Start drawing ─── */
  const startDrawing = useCallback(() => {
    resetDrawing();
    setIsDrawing(true);

    const map = mapRef.current;
    if (!map) return;

    map.setOptions({ draggableCursor: "crosshair", draggable: false });

    polylineRef.current = new google.maps.Polyline({
      map,
      strokeColor: "#00c898",
      strokeWeight: 2,
      strokeOpacity: 0.8,
      clickable: false,
    });

    clickListenerRef.current = google.maps.event.addListener(map, "click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const pos = e.latLng;
      pointsRef.current.push(pos);
      setPointCount(pointsRef.current.length);

      const path = polylineRef.current?.getPath();
      if (path) {
        if (pointsRef.current.length === 1) {
          path.push(pos);
          path.push(pos); // floating cursor point
        } else {
          path.setAt(path.getLength() - 1, pos);
          path.push(pos); // new floating cursor point
        }
      }

      const isFirst = pointsRef.current.length === 1;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: pos,
        map,
        content: createMarkerContent(isFirst ? 10 : 5, isFirst),
        zIndex: isFirst ? 100 : 10,
      });

      if (isFirst && marker.element) {
        marker.element.addEventListener("mouseenter", () => {
          if (pointsRef.current.length >= 3) {
            marker.content = createMarkerContent(14, true);
            marker.title = "Click to finish measurements";
          }
        });
        marker.element.addEventListener("mouseleave", () => {
          marker.content = createMarkerContent(10, true);
          marker.title = "";
        });
        marker.element.addEventListener("click", (evt) => {
          evt.stopPropagation();
          if (pointsRef.current.length >= 3) finishDrawing();
        });
      }

      markersRef.current.push(marker);
    });

    moveListenerRef.current = google.maps.event.addListener(map, "mousemove", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || pointsRef.current.length === 0) return;
      const path = polylineRef.current?.getPath();
      if (path && path.getLength() > pointsRef.current.length) {
        path.setAt(pointsRef.current.length, e.latLng);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishDrawing]);

  /* ─── Undo last point ─── */
  const undoLastPoint = useCallback(() => {
    if (pointsRef.current.length === 0) return;

    pointsRef.current.pop();
    setPointCount(pointsRef.current.length);

    const lastMarker = markersRef.current.pop();
    if (lastMarker) lastMarker.map = null;

    const path = polylineRef.current?.getPath();
    if (path && path.getLength() > 0) {
      const len = path.getLength();
      if (len >= 2) {
        path.removeAt(len - 2);
      } else {
        path.removeAt(len - 1);
      }
    }

    if (pointsRef.current.length === 0) {
      resetDrawing();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Right-click drag to pan ─── */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return; // only right-click
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current || !panStartRef.current || !mapRef.current) return;
      const dx = panStartRef.current.x - e.clientX;
      const dy = panStartRef.current.y - e.clientY;
      mapRef.current.panBy(dx, dy);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 2) return;
      isPanningRef.current = false;
      panStartRef.current = null;
      container.style.cursor = "";
    };

    container.addEventListener("contextmenu", onContextMenu);
    container.addEventListener("mousedown", onMouseDown);
    globalThis.addEventListener("mousemove", onMouseMove);
    globalThis.addEventListener("mouseup", onMouseUp);

    return () => {
      container.removeEventListener("contextmenu", onContextMenu);
      container.removeEventListener("mousedown", onMouseDown);
      globalThis.removeEventListener("mousemove", onMouseMove);
      globalThis.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  /* ─── Reset ─── */
  const resetDrawing = useCallback(() => {
    pointsRef.current = [];
    setPointCount(0);
    clearAllMapObjects();
    mapRef.current?.setOptions({ draggableCursor: null, draggable: true });
    setMeasuredArea(null);
    setIsDrawing(false);
  }, [clearAllMapObjects]);

  const confirmArea = () => {
    if (measuredArea) onAreaMeasured(measuredArea);
  };

  return (
    <dialog
      open
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm w-full h-full max-w-none max-h-none m-0 p-0 border-none bg-transparent"
      aria-label="Measure your site"
    >
      <div className="relative w-full max-w-4xl mx-4 rounded-3xl border border-border bg-surface overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-lg font-bold">Measure Your Site</h3>
            <p className="text-sm text-text-secondary">
              Search your address, then draw around the area to measure
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-xl bg-surface-overlay flex items-center justify-center hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Address Input */}
        <div className="p-5 border-b border-border">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter your address..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
              onFocus={loadApi}
            />
          </div>
        </div>

        {/* Map */}
        <div className="relative touch-none">
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] sm:h-[500px] bg-surface-overlay"
          />

          {/* Map not loaded state */}
          {!mapReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-overlay">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-brand" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-primary">Search your address above</p>
                <p className="text-sm text-text-secondary mt-1">
                  The map will load once you select an address
                </p>
              </div>
            </div>
          )}

          {/* Drawing Controls */}
          {mapReady && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {!isDrawing && !measuredArea && (
                <button
                  onClick={startDrawing}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-base font-bold shadow-xl transition-all bg-brand text-surface hover:bg-brand-light hover:scale-105 animate-pulse hover:animate-none ring-2 ring-brand/50 ring-offset-2 ring-offset-black/50"
                >
                  <Pencil className="w-5 h-5" />
                  Start Measuring
                </button>
              )}
              {isDrawing && (
                <>
                  <button
                    onClick={finishDrawing}
                    disabled={pointCount < 3}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-colors bg-brand text-surface hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    Finish
                  </button>
                  <button
                    onClick={undoLastPoint}
                    disabled={pointCount === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-sm font-medium text-text-secondary hover:border-brand hover:text-brand transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo
                  </button>
                </>
              )}
              {(measuredArea !== null || isDrawing) && (
                <button
                  onClick={resetDrawing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-sm font-medium text-text-secondary hover:border-red-500 hover:text-red-400 transition-colors shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Area Result */}
          {measuredArea !== null && (
            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/95 backdrop-blur-md rounded-2xl border border-brand/30 p-4 shadow-lg">
              <div className="text-center sm:text-left">
                <p className="text-xs text-brand font-semibold tracking-wider uppercase">
                  Measured Area
                </p>
                <p className="text-2xl font-bold font-mono">
                  {measuredArea.toLocaleString()} <span className="text-sm text-text-muted">sq ft</span>
                </p>
              </div>
              <button
                onClick={confirmArea}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand text-surface font-semibold hover:bg-brand-light transition-colors"
              >
                Use This Area
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {mapReady && !measuredArea && !isDrawing && (
          <div className="p-4 text-center text-sm text-text-muted border-t border-border">
            Click &quot;Start Measuring&quot; then <strong>left-click</strong> to place points. <strong>Right-click + drag</strong> to move the map.
          </div>
        )}
        {mapReady && isDrawing && (
          <div className="p-4 text-center text-sm text-brand font-medium border-t border-brand/20 bg-brand/5">
            {pointCount === 0 && "Left-click on the map to place your first corner. Right-click + drag to move the map."}
            {pointCount > 0 && pointCount < 3 && `${pointCount} point${pointCount > 1 ? "s" : ""} placed — need at least 3. Right-click + drag to pan.`}
            {pointCount >= 3 && `${pointCount} points placed — click your first point or press "Finish" to complete.`}
          </div>
        )}
      </div>
    </dialog>
  );
}
