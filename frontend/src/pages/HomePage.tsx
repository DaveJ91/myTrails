import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { Hike } from '../types/hike';
import { HikeCard } from '../components/HikeCard';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'any' | 'hiking' | 'bicycletouring' | 'bikepacking'>('any');
  
  const { data: hikes, isLoading, error } = useQuery<Hike[]>({
    queryKey: ['hikes'],
    queryFn: async () => {
      const response = await api.get('/hikes');
      return response.data;
    },
  });

  const filteredHikes = activeTab === 'any' 
    ? hikes 
    : hikes?.filter(hike => (hike.activityType || 'hiking') === activeTab);

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error loading hikes</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="relative rounded-2xl p-8 mb-8 shadow-2xl border-2 border-forest-accent/50 overflow-hidden group">
        <div className="absolute inset-0">
          <img 
            src="/banner-bg.png" 
            alt="Mountain landscape" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">2026 Ideas</h1>
            <p className="text-cream text-lg font-medium">Plan your next adventure</p>
          </div>
          <Link to="/create" className="group px-8 py-4 bg-gradient-to-r from-forest-accent to-moss text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg border border-white/20 flex items-center gap-2 shadow-xl">
            <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span> Add Trip
          </Link>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('any')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
            activeTab === 'any'
              ? 'bg-forest-accent text-white shadow-lg scale-105'
              : 'bg-white/80 text-forest-dark hover:bg-white'
          }`}
        >
          🌍 Any
        </button>
        <button
          onClick={() => setActiveTab('hiking')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
            activeTab === 'hiking'
              ? 'bg-forest-accent text-white shadow-lg scale-105'
              : 'bg-white/80 text-forest-dark hover:bg-white'
          }`}
        >
          🥾 Hiking
        </button>
        <button
          onClick={() => setActiveTab('bicycletouring')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
            activeTab === 'bicycletouring'
              ? 'bg-forest-accent text-white shadow-lg scale-105'
              : 'bg-white/80 text-forest-dark hover:bg-white'
          }`}
        >
          🚲 Bicycle Touring
        </button>
        <button
          onClick={() => setActiveTab('bikepacking')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
            activeTab === 'bikepacking'
              ? 'bg-forest-accent text-white shadow-lg scale-105'
              : 'bg-white/80 text-forest-dark hover:bg-white'
          }`}
        >
          🚵 Bikepacking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHikes?.map((hike) => (
          <HikeCard key={hike.id} hike={hike} />
        ))}
      </div>
      {filteredHikes?.length === 0 && (
        <div className="text-center text-cream mt-16 bg-white/10 backdrop-blur-md p-12 rounded-2xl shadow-2xl border border-white/20">
          <p className="text-2xl font-semibold">
            {activeTab === 'hiking' ? '🏔️ No hikes found.' : '🚲 No bike tours found.'} Start planning your 2026 adventure!
          </p>
        </div>
      )}
    </div>
  );
};
