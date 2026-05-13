import React, { useMemo, useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';
import type { DisasterPhase } from '../hooks/usePhase';
import { AlertTriangle, Hospital, Home, Truck, Helicopter, Wind } from 'lucide-react';
import api from '../lib/axios';

interface InteractiveMapProps {
  phase: DisasterPhase;
  alerts: any[];
  sosRequests: any[];
  simulationData?: any;
  evacuationRoute?: any; 
  rescueUnits?: any[];
  focusCoords?: { lat: number, lng: number } | null;
  hoveredAlertId?: string | null;
}

function createCirclePolygon(center: [number, number], radiusKm: number, steps = 64): any {
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dx = radiusKm / 111.32 * Math.cos(angle);
    const dy = radiusKm / (111.32 * Math.cos(center[1] * Math.PI / 180)) * Math.sin(angle);
    coords.push([center[0] + dy, center[1] + dx]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: { radiusKm }
  };
}

export const InteractiveDisasterMap: React.FC<InteractiveMapProps> = ({ 
  phase, 
  alerts, 
  sosRequests,
  simulationData,
  evacuationRoute,
  rescueUnits = [],
  focusCoords,
  hoveredAlertId
}) => {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 80.2707,
    latitude: 13.0827,
    zoom: 11,
    pitch: 45,
    bearing: 0
  });

  // 🏥 Real-World Greater Chennai Facilities (Regional Truth Layer)
  const realChennaiFacilities = useMemo(() => [
    // --- Central Chennai ---
    { id: 'h1', name: 'Rajiv Gandhi Govt General Hospital', type: 'hospital', lat: 13.0827, lng: 80.2754 },
    { id: 'h2', name: 'Apollo Hospitals (Greams Road)', type: 'hospital', lat: 13.0617, lng: 80.2526 },
    { id: 'h9', name: 'Kilpauk Medical College', type: 'hospital', lat: 13.0786, lng: 80.2452 },
    { id: 'h10', name: 'Madras Medical College', type: 'hospital', lat: 13.0818, lng: 80.2764 },
    { id: 'h11', name: 'Billroth Hospitals', type: 'hospital', lat: 13.0764, lng: 80.2285 },
    { id: 'h12', name: 'Kanchi Kamakoti CHILDS Trust', type: 'hospital', lat: 13.0564, lng: 80.2435 },
    
    // --- South Chennai & OMR ---
    { id: 'h3', name: 'MIOT International', type: 'hospital', lat: 13.0232, lng: 80.1772 },
    { id: 'h4', name: 'Fortis Malar Hospital', type: 'hospital', lat: 13.0034, lng: 80.2541 },
    { id: 'h8', name: 'Gleneagles Global Health City', type: 'hospital', lat: 12.9116, lng: 80.2114 },
    { id: 'h13', name: 'Chettinad Health City', type: 'hospital', lat: 12.8250, lng: 80.2220 },
    { id: 'h14', name: 'Kamakshi Memorial Hospital', type: 'hospital', lat: 12.9460, lng: 80.2050 },
    { id: 'h15', name: 'Dr. Rela Institute (Chromepet)', type: 'hospital', lat: 12.9480, lng: 80.1420 },
    { id: 'h16', name: 'V.H.S. Hospital (Adyar)', type: 'hospital', lat: 12.9980, lng: 80.2450 },

    // --- North Chennai ---
    { id: 'h7', name: 'Govt Stanley Medical College', type: 'hospital', lat: 13.1066, lng: 80.2878 },
    { id: 'h17', name: 'Tondiarpet General Hospital', type: 'hospital', lat: 13.1250, lng: 80.2890 },
    { id: 'h18', name: 'Aakash Hospital (Tiruvottiyur)', type: 'hospital', lat: 13.1620, lng: 80.3010 },
    { id: 'h19', name: 'Perambur Railway Hospital', type: 'hospital', lat: 13.1110, lng: 80.2420 },

    // --- West Chennai & Bypass ---
    { id: 'h5', name: 'Sri Ramachandra Medical Centre', type: 'hospital', lat: 13.0375, lng: 80.1448 },
    { id: 'h6', name: 'SIMS Hospital (Vadapalani)', type: 'hospital', lat: 13.0487, lng: 80.2091 },
    { id: 'h20', name: 'Saveetha Medical College', type: 'hospital', lat: 13.0310, lng: 79.9980 },
    { id: 'h21', name: 'Sundaram Medical Foundation', type: 'hospital', lat: 13.0840, lng: 80.2020 },
    { id: 'h22', name: 'ACS Medical College', type: 'hospital', lat: 13.0510, lng: 80.1550 },

    // --- NGO & Relief Hubs (Strategic Locations) ---
    { id: 'n1', name: 'Goonj Chennai Regional Hub', type: 'ngo', lat: 13.0125, lng: 80.2154 },
    { id: 'n2', name: 'Bhoomika Trust HQ', type: 'ngo', lat: 13.0415, lng: 80.2485 },
    { id: 'n3', name: 'Udhavum Ullangal (Nungambakkam)', type: 'ngo', lat: 13.0712, lng: 80.2215 },
    { id: 'n4', name: 'Chennai Volunteers (Adyar)', type: 'ngo', lat: 13.0020, lng: 80.2510 },
    { id: 'n5', name: 'Aid India Hub', type: 'ngo', lat: 13.0350, lng: 80.2420 },

    // --- Major Shelter/Relief Camps ---
    { id: 's1', name: 'GCC Headquarters Command', type: 'shelter', lat: 13.0878, lng: 80.2785 },
    { id: 's2', name: 'Nehru Indoor Stadium Shelter', type: 'shelter', lat: 13.0841, lng: 80.2707 },
    { id: 's3', name: 'Anna Nagar Relief Camp', type: 'shelter', lat: 13.0850, lng: 80.2100 },
    { id: 's4', name: 'Velachery Community Center', type: 'shelter', lat: 12.9810, lng: 80.2240 },
    { id: 's5', name: 'Tambaram East Relief Zone', type: 'shelter', lat: 12.9250, lng: 80.1250 },
    { id: 's6', name: 'Avadi Municipal Shelter', type: 'shelter', lat: 13.1180, lng: 80.1020 },
  ], []);

  const [facilities, setFacilities] = useState<any[]>(realChennaiFacilities);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [scanPos, setScanPos] = useState(0);

  // 🛰️ Global Satellite Scan Animation
  useEffect(() => {
    const t = setInterval(() => {
      setScanPos(prev => (prev + 0.5) % 100);
    }, 50);
    return () => clearInterval(t);
  }, []);

  // Sync state with memoized truth layer
  useEffect(() => {
    setFacilities(realChennaiFacilities);
  }, [realChennaiFacilities]);

  useEffect(() => {
    if (focusCoords) {
      setViewState(prev => ({
        ...prev,
        longitude: focusCoords.lng,
        latitude: focusCoords.lat,
        zoom: 14,
        transitionDuration: 1000
      }));
    }
  }, [focusCoords]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    // 🎨 Load Custom Tactical Icons
    const icons = {
      'hospital-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
      'shelter-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34a853" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      'ngo-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    };

    Object.entries(icons).forEach(([name, svg]) => {
      if (!map.hasImage(name)) {
        const img = new Image(24, 24);
        img.onload = () => map.addImage(name, img);
        img.src = 'data:image/svg+xml;base64,' + btoa(svg);
      }
    });
  }, [mapRef.current]);

  const alertGeoJson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: alerts.map(a => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [a.lng || 80.2707, a.lat || 13.0827] },
      properties: { id: a.id, severity: a.severity_normalized, headline: a.headline }
    }))
  }), [alerts]);

  const simPolygonGeoJson = useMemo(() => {
    if (!simulationData) return null;
    const radiusKm = Math.max(0.5, simulationData.radius || 0);
    const center: [number, number] = [simulationData.lon || 80.2707, simulationData.lat || 13.0827];
    return {
      type: 'FeatureCollection' as const,
      features: [createCirclePolygon(center, radiusKm)]
    };
  }, [simulationData]);

  const routeGeoJson = useMemo(() => {
    if (!evacuationRoute) return null;
    return {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        geometry: evacuationRoute,
        properties: { type: 'evacuation' }
      }]
    };
  }, [evacuationRoute]);

  // 📐 Tactical Vectors: Connect Units to their SOS targets
  const vectorGeoJson = useMemo(() => {
    const features = rescueUnits
      .filter(u => u.targetId)
      .map(unit => {
        const target = sosRequests.find(s => s.id === unit.targetId);
        if (!target) return null;
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[unit.lng, unit.lat], [target.lng, target.lat]]
          },
          properties: { id: unit.id }
        };
      })
      .filter(f => f !== null);

    return { type: 'FeatureCollection', features };
  }, [rescueUnits, sosRequests]);

  const facilityGeoJson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: facilities.filter(f => f.lat && f.lng).map(f => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { id: f.id, name: f.name, type: f.type, ownership: f.ownership_type }
    }))
  }), [facilities]);

  return (
    <div className="w-full h-full relative group">
      {/* 🛰️ Satellite Scanline Overlay (CSS) */}
      <div 
        className="absolute left-0 w-full h-[2px] bg-cyan-500/30 blur-[1px] z-[5000] pointer-events-none transition-all duration-75 ease-linear"
        style={{ top: `${scanPos}%`, boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}
      />
      
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={['alerts-layer']}
        onClick={(e) => {
          if (e.features && e.features.length > 0) {
            const feat = e.features[0];
            setSelectedAlert(feat.properties);
          } else {
            setSelectedAlert(null);
          }
        }}
      >
        <NavigationControl position="bottom-right" />

        <Source id="alerts-source" type="geojson" data={alertGeoJson as any}>
            <Layer 
              id="alerts-heatmap" 
              type="heatmap"
              paint={{
                'heatmap-weight': ['match', ['get', 'severity'], 'Critical', 1, 'Extreme', 1, 0.5],
                'heatmap-intensity': 1,
                'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.2, '#fde047', 0.5, '#f59e0b', 1, '#ef4444'],
                'heatmap-radius': 30,
                'heatmap-opacity': 0.6
              }}
            />
            <Layer 
              id="alerts-layer" 
              type="circle"
              paint={{
                'circle-radius': ['case', ['==', ['get', 'id'], hoveredAlertId || ''], 10, 5],
                'circle-color': ['match', ['get', 'severity'], 'Critical', '#ef4444', 'Extreme', '#ef4444', '#f59e0b'],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }}
            />
        </Source>

        <Source id="facilities-source" type="geojson" data={facilityGeoJson as any} cluster={true} clusterMaxZoom={14} clusterRadius={50}>
          {/* 🔘 Cluster Circles (High-Performance Grouping) */}
          <Layer
            id="facility-clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': ['step', ['get', 'point_count'], '#1a73e8', 5, '#34a853', 15, '#fbbc05'],
              'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 15, 30],
              'circle-opacity': 0.7,
              'circle-stroke-width': 3,
              'circle-stroke-color': 'rgba(255,255,255,0.4)',
              'circle-blur': 0.2
            }}
          />
          {/* 🔢 Cluster Counts */}
          <Layer
            id="facility-cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count}',
              'text-size': 14,
              'text-allow-overlap': true
            }}
            paint={{ 'text-color': '#ffffff' }}
          />
          {/* 📍 Individual Real-World Assets (Icons) */}
          <Layer
            id="facilities-layer"
            type="symbol"
            filter={['!', ['has', 'point_count']]}
            layout={{
              'icon-image': [
                'match', ['get', 'type'],
                'hospital', 'hospital-icon',
                'shelter', 'shelter-icon',
                'ngo-icon'
              ],
              'icon-size': 0.8,
              'icon-allow-overlap': false,
              'text-field': ['get', 'name'],
              'text-size': 9,
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 1.2,
              'text-justify': 'auto',
              'text-allow-overlap': false
            }}
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(0,0,0,0.9)',
              'text-halo-width': 1.5
            }}
          />
        </Source>

        {/* 📐 Tactical Interception Vectors */}
        <Source id="vector-source" type="geojson" data={vectorGeoJson as any}>
          <Layer 
            id="vector-line-glow" 
            type="line" 
            paint={{ 
              'line-color': '#06b6d4', 
              'line-width': 4, 
              'line-opacity': 0.15,
              'line-blur': 4
            }} 
          />
          <Layer 
            id="vector-line" 
            type="line" 
            paint={{ 
              'line-color': '#06b6d4', 
              'line-width': 1.5,
              'line-dasharray': [3, 2]
            }} 
          />
        </Source>

        {phase === 'MID_DISASTER' && simPolygonGeoJson && (
          <Source id="simulation-source" type="geojson" data={simPolygonGeoJson as any}>
            <Layer id="simulation-fill" type="fill" paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.2 }} />
            <Layer id="simulation-outline" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 2, 'line-dasharray': [4, 2] }} />
          </Source>
        )}

        {phase === 'MID_DISASTER' && routeGeoJson && (
          <Source id="route-source" type="geojson" data={routeGeoJson as any}>
            <Layer id="route-line-glow" type="line" paint={{ 'line-color': '#22c55e', 'line-width': 6, 'line-opacity': 0.2, 'line-blur': 3 }} />
            <Layer id="route-line" type="line" paint={{ 'line-color': '#4ade80', 'line-width': 2, 'line-dasharray': [2, 1] }} />
          </Source>
        )}

        {phase === 'MID_DISASTER' && simulationData?.type === 'cyclone' && (
          <Marker longitude={simulationData.lon} latitude={simulationData.lat} anchor="center">
             <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full animate-ping" />
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-indigo-300 relative z-10 animate-spin-slow">
                   <Wind className="text-white" size={24} />
                </div>
             </div>
          </Marker>
        )}

        {rescueUnits.map(unit => (
          <Marker key={unit.id} longitude={unit.lng} latitude={unit.lat} anchor="center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative flex items-center justify-center cursor-pointer group">
              <div className={`absolute w-10 h-10 ${unit.targetId ? 'bg-amber-500/20' : 'bg-cyan-500/20'} rounded-full animate-ping`}></div>
              <div className={`w-8 h-8 ${unit.targetId ? 'bg-amber-600' : 'bg-cyan-600'} rounded-full border-2 border-white shadow-lg flex items-center justify-center relative z-10 transition-colors duration-500`}>
                {unit.type === 'heli' ? <Helicopter className="text-white" size={16} /> : <Truck className="text-white" size={16} />}
              </div>
              
              {/* Tactical Info Tag */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-2 py-1 rounded text-[8px] font-black whitespace-nowrap z-[1000] border border-white/10 backdrop-blur-md">
                <span className="text-cyan-400">{unit.id}</span> • {unit.status} • {unit.speed} KM/H
              </div>
            </motion.div>
          </Marker>
        ))}

        {phase === 'MID_DISASTER' && sosRequests.map(sos => (
          <Marker key={sos.id} longitude={sos.lng} latitude={sos.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-10 h-10 bg-red-600/30 rounded-full animate-ping"></div>
              <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center" />
              
              {/* Extraction Point Indicator */}
              {rescueUnits.some(u => u.targetId === sos.id) && (
                <div className="absolute -inset-2 border-2 border-cyan-400 rounded-full animate-spin-slow border-dashed opacity-60" />
              )}
            </div>
          </Marker>
        ))}

        {selectedAlert && (
          <Popup longitude={viewState.longitude} latitude={viewState.latitude} anchor="top" onClose={() => setSelectedAlert(null)}>
            <div className="p-2 min-w-[180px]">
              <p className="text-[10px] font-black text-red-500 uppercase mb-1">{selectedAlert.severity}</p>
              <p className="text-xs font-bold text-slate-800 leading-tight">{selectedAlert.headline}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
export default InteractiveDisasterMap;
