import React from 'react';
import { Link } from 'react-router-dom';
import type { Hike } from '../types/hike';

interface HikeCardProps {
  hike: Hike;
}

import { MapComponent } from './MapComponent';

export const HikeCard: React.FC<HikeCardProps> = ({ hike }) => {
  // Calculate estimated days based on 25km per day
  const estimatedDays = hike.distance ? Math.ceil(hike.distance / 25) : null;
  
  // Country flag emoji mapping
  const countryFlags: Record<string, string> = {
    'italy': '🇮🇹',
    'france': '🇫🇷',
    'spain': '🇪🇸',
    'portugal': '🇵🇹',
    'switzerland': '🇨🇭',
    'austria': '🇦🇹',
    'germany': '🇩🇪',
    'uk': '🇬🇧',
    'ireland': '🇮🇪',
    'norway': '🇳🇴',
    'sweden': '🇸🇪',
    'iceland': '🇮🇸',
  };
  
  const getCountryFlag = (country?: string) => {
    if (!country) return '🌍';
    const normalized = country.toLowerCase().trim();
    return countryFlags[normalized] || '🌍';
  };

  return (
    <Link to={`/hikes/${hike.id}`} className="block bg-white/98 backdrop-blur-sm rounded-2xl border-2 border-white/40 shadow-2xl hover:shadow-3xl hover:border-forest-accent/60 transition-all overflow-hidden group transform hover:-translate-y-1">
      <div className="h-52 w-full relative overflow-hidden">
        {hike.gpxContent ? (
          <>
            <MapComponent gpxContent={hike.gpxContent} interactive={false} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-forest-light/30 to-earth-light/30 flex items-center justify-center text-earth-brown">
            <span className="text-xl font-semibold">🗺️ No Map</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-forest-dark to-forest-medium text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          📅 {new Date(hike.date).toLocaleDateString()}
        </div>
      </div>
      <div className="p-6 bg-gradient-to-b from-white to-cream/50">
        <h5 className="mb-3 text-2xl font-bold tracking-tight text-forest-dark group-hover:text-forest-accent transition-colors">{hike.title}</h5>
        <div className="flex flex-wrap gap-2 mb-4">
            {hike.distance && (
              <span className="bg-gradient-to-r from-forest-accent/20 to-moss/20 text-forest-dark px-3 py-1.5 rounded-full font-semibold text-sm border border-forest-accent/30">
                📏 {Math.ceil(hike.distance)} km
              </span>
            )}{hike.elevationGain && <span className="bg-gradient-to-r from-earth-brown/20 to-earth-light/20 text-forest-dark px-3 py-1.5 rounded-full font-semibold text-sm border border-earth-brown/30">⛰️ {hike.elevationGain.toLocaleString()}m ↑</span>}
          {estimatedDays && <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-forest-dark px-3 py-1.5 rounded-full font-semibold text-sm border border-blue-300">⏱️ ~{estimatedDays} {estimatedDays === 1 ? 'day' : 'days'}</span>}
          {hike.countries?.map((country, index) => (
            <span key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 text-forest-dark px-3 py-1.5 rounded-full font-semibold text-sm border border-purple-300">{getCountryFlag(country)} {country}</span>
          ))}
        </div>
        <p className="font-normal text-gray-700 line-clamp-2 text-sm">{hike.description}</p>
      </div>
    </Link>
  );
};
