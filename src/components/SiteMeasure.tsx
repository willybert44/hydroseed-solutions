"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, Pencil, RotateCcw, X } from "lucide-react";

/* ─── Google Maps type helpers ─── */
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const PITTSBURGH_CENTER = { lat: 40.4406, lng: -79.9959 };

let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (mapsLoadPromise) return mapsLoadPromise;
  if (window.google?.maps?.places) return Promise.resolve();

  mapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    window.initGoogleMaps = () => {
      delete window.initGoogleMaps;
      resolve();
    };
    script.onerror = () => {
      mapsLoadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

function computeAreaSqFt(polygon: google.maps.Polygon): number {
  const areaM2 = google.maps.geometry
    ? google.maps.geometry.spherical.computeArea(polygon.getPath())
    : 0;
  return Math.round(areaM2 * 10.7639);
}

interface SiteMeasureProps {
  onAreaMeasured: (sqft: number) => void;
  onClose: () => void;
}

export default function SiteMeasure({ onAreaMeasured, onClose }: SiteMeasureProps) {
  const [address, setAddress] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [measuredArea, setMeasuredArea] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const initMap = useCallback(async () => {
    await loadGoogleMaps();

    if (!mapContainerRef.current) return;

    const map = new google.maps.Map(mapContainerRef.current, {
      center: PITTSBURGH_CENTER,
      zoom: 18,
      mapTypeId: "satellite",
      tilt: 0,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapRef.current = map;

    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: "#00c898",
        fillOpacity: 0.3,
        strokeColor: "#00c898",
        strokeWeight: 2,
        editable: true,
        draggable: true,
      },
    });
    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    google.maps.event.addListener(drawingManager, "polygoncomplete", (polygon: google.maps.Polygon) => {
      // Remove previous polygon
      if (polygonRef.current) polygonRef.current.setMap(null);
      polygonRef.current = polygon;

      const area = computeAreaSqFt(polygon);
      setMeasuredArea(area);
      setIsDrawing(false);
      drawingManager.setDrawingMode(null);

      // Update area on edit
      google.maps.event.addListener(polygon.getPath(), "set_at", () => {
        setMeasuredArea(computeAreaSqFt(polygon));
      });
      google.maps.event.addListener(polygon.getPath(), "insert_at", () => {
        setMeasuredArea(computeAreaSqFt(polygon));
      });
    });

    setMapReady(true);
  }, []);

  // Set up autocomplete after map is ready
  useEffect(() => {
    if (!mapReady || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["geometry", "formatted_address"],
    });
    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location && mapRef.current) {
        mapRef.current.setCenter(place.geometry.location);
        mapRef.current.setZoom(20);
        setAddress(place.formatted_address ?? "");
      }
    });
  }, [mapReady]);

  const startDrawing = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
      setMeasuredArea(null);
    }
    drawingManagerRef.current?.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    setIsDrawing(true);
  };

  const resetDrawing = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setMeasuredArea(null);
    setIsDrawing(false);
    drawingManagerRef.current?.setDrawingMode(null);
  };

  const confirmArea = () => {
    if (measuredArea) {
      onAreaMeasured(measuredArea);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm">
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
              onFocus={() => {
                if (!mapReady) initMap();
              }}
            />
          </div>
        </div>

        {/* Map */}
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] sm:h-[500px] bg-surface-overlay"
          />

          {/* Map not loaded state */}
          {!mapReady && (
            <button
              onClick={initMap}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-overlay cursor-pointer hover:bg-surface-raised transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-brand" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-primary">Click to load map</p>
                <p className="text-sm text-text-secondary mt-1">
                  Enter your address above or click here to start
                </p>
              </div>
            </button>
          )}

          {/* Drawing Controls */}
          {mapReady && (
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={startDrawing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-colors ${
                  isDrawing
                    ? "bg-brand text-surface"
                    : "bg-surface text-text-primary border border-border hover:border-brand"
                }`}
              >
                <Pencil className="w-4 h-4" />
                {isDrawing ? "Drawing..." : "Draw Area"}
              </button>
              {(measuredArea || isDrawing) && (
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
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-surface/95 backdrop-blur-md rounded-2xl border border-brand/30 p-4 shadow-lg">
              <div>
                <p className="text-xs text-brand font-semibold tracking-wider uppercase">
                  Measured Area
                </p>
                <p className="text-2xl font-bold font-mono">
                  {measuredArea.toLocaleString()} <span className="text-sm text-text-muted">sq ft</span>
                </p>
              </div>
              <button
                onClick={confirmArea}
                className="px-6 py-3 rounded-xl bg-brand text-surface font-semibold hover:bg-brand-light transition-colors"
              >
                Use This Area
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {mapReady && !measuredArea && !isDrawing && (
          <div className="p-4 text-center text-sm text-text-muted border-t border-border">
            Click &quot;Draw Area&quot; then click points on the map to outline your property. Double-click to finish.
          </div>
        )}
      </div>
    </div>
  );
}
