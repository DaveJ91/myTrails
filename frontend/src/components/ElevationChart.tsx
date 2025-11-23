import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ElevationChartProps {
  gpxContent: string;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({ gpxContent }) => {
  const elevationData = useMemo(() => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
      const trackPoints = xmlDoc.getElementsByTagName('trkpt');
      
      const data: { distance: number; elevation: number }[] = [];
      let cumulativeDistance = 0;
      let lastLat = 0;
      let lastLon = 0;

      for (let i = 0; i < trackPoints.length; i++) {
        const pt = trackPoints[i];
        const lat = parseFloat(pt.getAttribute('lat') || '0');
        const lon = parseFloat(pt.getAttribute('lon') || '0');
        const eleNode = pt.getElementsByTagName('ele')[0];
        const elevation = eleNode ? parseFloat(eleNode.textContent || '0') : 0;

        if (i > 0) {
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = (lat - lastLat) * Math.PI / 180;
          const dLon = (lon - lastLon) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lastLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          cumulativeDistance += distance;
        }

        // Sample every 10th point to reduce data size
        if (i % 10 === 0 || i === trackPoints.length - 1) {
          data.push({
            distance: parseFloat(cumulativeDistance.toFixed(2)),
            elevation: parseFloat(elevation.toFixed(0)),
          });
        }

        lastLat = lat;
        lastLon = lon;
      }

      return data;
    } catch (error) {
      console.error('Error parsing GPX for elevation:', error);
      return [];
    }
  }, [gpxContent]);

  if (elevationData.length === 0) {
    return <div className="text-gray-500 text-center p-4">No elevation data available</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={elevationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a7c2c" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4a7c2c" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="distance" 
            label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => Math.ceil(value).toString()}
          />
          <YAxis 
            label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '8px'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'elevation') return [`${value} m`, 'Elevation'];
              return [value, name];
            }}
            labelFormatter={(label) => `${label} km`}
          />
          <Area 
            type="monotone" 
            dataKey="elevation" 
            stroke="#2d5016" 
            strokeWidth={2}
            fill="url(#elevationGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
