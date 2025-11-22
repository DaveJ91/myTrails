import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export const CreateHikePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allTrailsUrl, setAllTrailsUrl] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [gpxContent, setGpxContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGpxContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gpxContent && !allTrailsUrl) {
      alert('Please provide either a GPX file or an AllTrails URL.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/hikes', {
        title,
        description,
        allTrailsUrl,
        countries,
        gpxContent,
        date: new Date(),
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to create hike', error);
      alert('Failed to create hike');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Add New Hike</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">AllTrails URL</label>
          <input
            type="url"
            value={allTrailsUrl}
            onChange={(e) => setAllTrailsUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="https://www.alltrails.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Countries (Ctrl/Cmd+click to select multiple)</label>
          <select
            multiple
            value={countries}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              setCountries(selected);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border h-32"
          >
            <option value="Italy">🇮🇹 Italy</option>
            <option value="France">🇫🇷 France</option>
            <option value="Spain">🇪🇸 Spain</option>
            <option value="Portugal">🇵🇹 Portugal</option>
            <option value="Switzerland">🇨🇭 Switzerland</option>
            <option value="Austria">🇦🇹 Austria</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="Ireland">🇮🇪 Ireland</option>
            <option value="Norway">🇳🇴 Norway</option>
            <option value="Sweden">🇸🇪 Sweden</option>
            <option value="Iceland">🇮🇸 Iceland</option>
            <option value="Netherlands">🇳🇱 Netherlands</option>
            <option value="Belgium">🇧🇪 Belgium</option>
            <option value="Denmark">🇩🇰 Denmark</option>
            <option value="Finland">🇫🇮 Finland</option>
            <option value="Poland">🇵🇱 Poland</option>
            <option value="Czech Republic">🇨🇿 Czech Republic</option>
            <option value="Croatia">🇭🇷 Croatia</option>
            <option value="Greece">🇬🇷 Greece</option>
            <option value="Slovenia">🇸🇮 Slovenia</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GPX File (Optional)</label>
          <input
            type="file"
            accept=".gpx"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Hike'}
          </button>
        </div>
      </form>
    </div>
  );
};
