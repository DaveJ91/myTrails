import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export const CreateHikePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allTrailsUrl, setAllTrailsUrl] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [activityType, setActivityType] = useState<'hiking' | 'bicycletouring' | 'bikepacking'>('hiking');
  const [gpxContent, setGpxContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        setGpxContent(content);
        
        // Analyze GPX with AI
        setAnalyzing(true);
        try {
          const res = await api.post('/hikes/analyze-gpx', { gpxContent: content });
          const { title, description, countries, allTrailsUrl, coverImage, activityType } = res.data;
          if (title) setTitle(title);
          if (description) setDescription(description);
          if (countries && Array.isArray(countries)) setCountries(countries);
          if (allTrailsUrl) setAllTrailsUrl(allTrailsUrl);
          if (coverImage) setCoverImage(coverImage);
          if (activityType) setActivityType(activityType);
        } catch (error) {
          console.error('Failed to analyze GPX', error);
        } finally {
          setAnalyzing(false);
        }
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
        activityType,
        gpxContent,
        coverImage,
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Add Trip</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GPX File (Optional - Upload first to auto-fill details!)</label>
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
          {analyzing && <p className="text-sm text-blue-600 mt-2 animate-pulse">🤖 Analyzing GPX and generating details...</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Type</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as any)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value="hiking">🥾 Hiking</option>
            <option value="bicycletouring">🚲 Bicycle Touring</option>
            <option value="bikepacking">🚵 Bikepacking</option>
          </select>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={analyzing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${analyzing ? 'bg-gray-100 text-gray-400' : ''}`}
              rows={4}
            />
            {analyzing && (
              <div className="absolute right-3 top-3">
                <span className="animate-spin inline-block">⏳</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">AllTrails URL</label>
          <div className="relative">
            <input
              type="url"
              value={allTrailsUrl}
              onChange={(e) => setAllTrailsUrl(e.target.value)}
              disabled={analyzing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${analyzing ? 'bg-gray-100 text-gray-400' : ''}`}
              placeholder="https://www.alltrails.com/..."
            />
            {analyzing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="animate-spin inline-block">⏳</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Countries (Ctrl/Cmd+click to select multiple)</label>
          <div className="relative">
            <select
              multiple
              value={countries}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                setCountries(selected);
              }}
              disabled={analyzing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border h-32 ${analyzing ? 'bg-gray-100 text-gray-400' : ''}`}
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
            {analyzing && (
              <div className="absolute right-3 top-3">
                <span className="animate-spin inline-block">⏳</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={analyzing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${analyzing ? 'bg-gray-100 text-gray-400' : ''}`}
              required
            />
            {analyzing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="animate-spin inline-block">⏳</span>
              </div>
            )}
          </div>
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
            {loading ? 'Saving...' : 'Save Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};
