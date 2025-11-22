import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  gpxContent: string;
  interactive?: boolean;
  className?: string;
}

const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds);
    }
  }, [map, positions]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ gpxContent, interactive = true, className = "h-[400px] w-full" }) => {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    if (gpxContent) {
      const parser = new DOMParser();
      const gpx = parser.parseFromString(gpxContent, 'text/xml');
      const trkpts = gpx.querySelectorAll('trkpt');
      const coords: [number, number][] = [];
      trkpts.forEach((pt) => {
        const lat = parseFloat(pt.getAttribute('lat') || '0');
        const lon = parseFloat(pt.getAttribute('lon') || '0');
        coords.push([lat, lon]);
      });
      setPositions(coords);
    }
  }, [gpxContent]);

  if (positions.length === 0) return <div className={className + " bg-gray-100 flex items-center justify-center"}>Loading map...</div>;

  return (
    <MapContainer 
      center={positions[0]} 
      zoom={13} 
      className={className}
      dragging={interactive}
      touchZoom={interactive}
      zoomControl={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Standard">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Topo">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      <Polyline positions={positions} color="blue" weight={4} />
      <FitBounds positions={positions} />
    </MapContainer>
  );
};
