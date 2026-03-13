"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, Pencil, RotateCcw, X, Check } from "lucide-react";

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

  const pointsRef = useRef<google.maps.LatLng[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const moveListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

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
      draggableCursor: 'crosshair', // Provide a visual cue for drawing out of the box
    });
    mapRef.current = map;

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

  const finishDrawing = useCallback(() => {
    if (pointsRef.current.length < 3) {
      alert("Please draw at least 3 points to create an area.");
      return;
    }
    
    const map = mapRef.current;
    if (!map) return;
    
    setIsDrawing(false);
    map.setOptions({ draggableCursor: null });
    
    if (moveListenerRef.current) google.maps.event.removeListener(moveListenerRef.current);
    if (clickListenerRef.current) google.maps.event.removeListener(clickListenerRef.current);
    if (polylineRef.current) polylineRef.current.setMap(null);
    
    markersRef.current.forEach(m => m.setMap(null));
    
    const finalPolygon = new google.maps.Polygon({
      paths: pointsRef.current,
      map: map,
      fillColor: "#00c898",
      fillOpacity: 0.3,
      strokeColor: "#00c898",
      strokeWeight: 2,
      editable: true,
      draggable: true,
    });
    polygonRef.current = finalPolygon;
    
    const calculateAndSet = () => setMeasuredArea(computeAreaSqFt(finalPolygon));
    calculateAndSet();
    
    google.maps.event.addListener(finalPolygon.getPath(), "set_at", calculateAndSet);
    google.maps.event.addListener(finalPolygon.getPath(), "insert_at", calculateAndSet);
  }, []);

  const startDrawing = () => {
    resetDrawing();
    setIsDrawing(true);
    
    const map = mapRef.current;
    if (!map) return;

    map.setOptions({ draggableCursor: 'crosshair' });
    
    polylineRef.current = new google.maps.Polyline({
      map: map,
      strokeColor: "#00c898",
      strokeWeight: 2,
      strokeOpacity: 0.8,
    });
    
    clickListenerRef.current = google.maps.event.addListener(map, 'click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      
      const pos = e.latLng;
      pointsRef.current.push(pos);
      
      const isFirst = pointsRef.current.length === 1;
      
      const marker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isFirst ? 10 : 5,
          fillColor: "#00c898",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        zIndex: isFirst ? 100 : 10
      });
      
      if (isFirst) {
        marker.addListener('mouseover', () => {
          if (pointsRef.current.length >= 3) {
            marker.setIcon({
              path: google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: "#00c898",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            });
            marker.setTitle("Click to finish measurements");
          }
        });
        marker.addListener('mouseout', () => {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10, 
            fillColor: "#00c898",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          });
          marker.setTitle("");
        });
        
        marker.addListener('click', () => {
          if (pointsRef.current.length >= 3) {
            finishDrawing();
          }
        });
      }
      
      markersRef.current.push(marker);
    });
    
    moveListenerRef.current = google.maps.event.addListener(map, 'mousemove', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || pointsRef.current.length === 0) return;
      
      const path = [...pointsRef.current, e.latLng];
      polylineRef.current?.setPath(path);
    });
  };

  const resetDrawing = () => {
    pointsRef.current = [];
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (polygonRef.current) polygonRef.current.setMap(null);
    
    if (moveListenerRef.current) google.maps.event.removeListener(moveListenerRef.current);
    if (clickListenerRef.current) google.maps.event.removeListener(clickListenerRef.current);
    
    const map = mapRef.current;
    if (map) {
      map.setOptions({ draggableCursor: null });
    }

    setMeasuredArea(null);
    setIsDrawing(false);
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
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {!isDrawing && !measuredArea && (
                <button
                  onClick={startDrawing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-colors bg-brand text-surface hover:bg-brand-light"
                >
                  <Pencil className="w-4 h-4" />
                  Start Measuring
                </button>
              )}
              {isDrawing && (
                <button
                  onClick={finishDrawing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-colors bg-brand text-surface hover:bg-brand-light"
                >
                  <Check className="w-4 h-4" />
                  Finish Measurements
                </button>
              )}
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
            Click &quot;Start Measuring&quot; then click points on the map to outline your property.
          </div>
        )}
        {mapReady && isDrawing && (
          <div className="p-4 text-center text-sm text-brand font-medium border-t border-brand/20 bg-brand/5">
            Click on the map to draw corners. To finish, click "Finish Measurements" or click your very first starting point.
          </div>
        )}
      </div>
    </div>
  );
}
