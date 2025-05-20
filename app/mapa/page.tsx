// app/mapa/page.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MapaPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard', // Mapbox Standard
      center: [-73.24709290051159, -39.8115],     
      zoom: 16,                                  // zoom al máximo detalle
      pitch: 70,                                 // inclinación pronunciada para 3D
      bearing: 90,                              // ligera rotación para mejor perspectiva
      maxZoom: 20,                               // permitir acercarse más si es necesario
    });

    map.on('load', () => {
      // aplicar iluminación de atardecer
      map.setConfigProperty('basemap', 'lightPreset', 'dusk');

      

      // controles
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
