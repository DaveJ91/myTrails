import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { Hike } from '../types/hike';
import { HikeCard } from '../components/HikeCard';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { data: hikes, isLoading, error } = useQuery<Hike[]>({
    queryKey: ['hikes'],
    queryFn: async () => {
      const response = await api.get('/hikes');
      return response.data;
    },
  });

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error loading hikes</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="bg-gradient-to-r from-forest-medium to-forest-light rounded-2xl p-8 mb-8 shadow-2xl border-2 border-forest-accent/50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">2026 Ideas</h1>
            <p className="text-cream text-lg font-medium">Plan your next adventure</p>
          </div>
          <Link to="/create" className="group px-8 py-4 bg-gradient-to-r from-forest-accent to-moss text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg border border-white/20 flex items-center gap-2 shadow-xl">
            <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span> Add New Hike
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hikes?.map((hike) => (
          <HikeCard key={hike.id} hike={hike} />
        ))}
      </div>
      {hikes?.length === 0 && (
        <div className="text-center text-cream mt-16 bg-white/10 backdrop-blur-md p-12 rounded-2xl shadow-2xl border border-white/20">
          <p className="text-2xl font-semibold">🏔️ No hikes found. Start planning your 2026 adventure!</p>
        </div>
      )}
    </div>
  );
};
