import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Hike } from '../types/hike';
import { MapComponent } from '../components/MapComponent';
import { ElevationChart } from '../components/ElevationChart';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const HikeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [isEditingMap, setIsEditingMap] = useState(false);
  const [newGpxContent, setNewGpxContent] = useState('');
  const [isEditingLogistics, setIsEditingLogistics] = useState(false);
  const [isGeneratingLogistics, setIsGeneratingLogistics] = useState(false);
  const [isLogisticsExpanded, setIsLogisticsExpanded] = useState(false);
  const [editLogistics, setEditLogistics] = useState('');
  
  const [isEditingAccommodation, setIsEditingAccommodation] = useState(false);
  const [isGeneratingAccommodation, setIsGeneratingAccommodation] = useState(false);
  const [isAccommodationExpanded, setIsAccommodationExpanded] = useState(false);
  const [editAccommodation, setEditAccommodation] = useState('');

  const [isEditingCountries, setIsEditingCountries] = useState(false);
  const [editCountries, setEditCountries] = useState<string[]>([]);

  const { data: hike, isLoading, error } = useQuery<Hike>({
    queryKey: ['hike', id],
    queryFn: async () => {
      const response = await api.get(`/hikes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Initialize edit states when data loads
  React.useEffect(() => {
    if (hike) {
      setEditTitle(hike.title);
      setEditNotes(hike.description || '');
      setEditUrl(hike.allTrailsUrl || '');
      setEditLogistics(hike.travelLogistics || '');
      setEditCountries(hike.countries || []);
    }
  }, [hike]);

  const updateHikeMutation = useMutation({
    mutationFn: async (updates: Partial<Hike>) => {
      await api.put(`/hikes/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike', id] });
      setIsEditingTitle(false);
      setIsEditingNotes(false);
      setIsEditingUrl(false);
      setIsEditingMap(false);
      setNewGpxContent('');
      setIsEditingLogistics(false);
      setIsEditingCountries(false);
    },
  });

  const handleGpxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewGpxContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const addPhotoMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!hike) return;
      const updatedPhotos = [...(hike.photos || []), url];
      await api.put(`/hikes/${id}`, { photos: updatedPhotos });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hike', id] });
      setPhotoUrl('');
    },
  });

  const deleteHikeMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/hikes/${id}`);
    },
    onSuccess: () => {
      navigate('/');
    },
  });

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error || !hike) return <div className="text-center mt-10 text-red-500">Error loading hike</div>;

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
    'netherlands': '🇳🇱',
    'belgium': '🇧🇪',
    'denmark': '🇩🇰',
    'finland': '🇫🇮',
    'poland': '🇵🇱',
    'czech republic': '🇨🇿',
    'croatia': '🇭🇷',
    'greece': '🇬🇷',
    'slovenia': '🇸🇮',
  };
  
  const getCountryFlag = (country?: string) => {
    if (!country) return '🌍';
    const normalized = country.toLowerCase().trim();
    return countryFlags[normalized] || '🌍';
  };


  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Hikes</Link>
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 mr-4">
          {isEditingTitle ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-3xl font-bold text-gray-800 dark:text-white border rounded p-1 w-full"
              />
              <button onClick={() => updateHikeMutation.mutate({ title: editTitle })} className="text-green-600 hover:text-green-800">Save</button>
              <button onClick={() => setIsEditingTitle(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          ) : (
            <div className="group flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{hike.title}</h1>
              <button onClick={() => setIsEditingTitle(true)} className="text-gray-400 hover:text-blue-600">✎</button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mt-4">
            {hike.distance && (
              <span className="bg-white/90 text-forest-dark px-4 py-2 rounded-full text-sm font-semibold shadow-md border border-earth-light/30">
                📏 {Math.ceil(hike.distance)} km
              </span>
            )}
            {hike.elevationGain && (
              <span className="bg-white/90 text-forest-dark px-4 py-2 rounded-full text-sm font-semibold shadow-md border border-earth-light/30">
                ⛰️ {hike.elevationGain.toLocaleString()}m ↑
              </span>
            )}

            {hike.countries && hike.countries.length > 0 && hike.countries.map((country, idx) => (
              <span key={idx} className="bg-gradient-to-r from-purple-100 to-pink-100 text-forest-dark px-4 py-2 rounded-full text-sm font-semibold shadow-md border border-purple-300 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsEditingCountries(true)}>
                {getCountryFlag(country)} {country} ✎
              </span>
            ))}
            {(!hike.countries || hike.countries.length === 0) && (
              <button onClick={() => setIsEditingCountries(true)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-semibold shadow-md border border-gray-300 hover:bg-gray-200">
                + Add Countries
              </button>
            )}
          </div>

            {isEditingCountries && (
              <div className="mt-4 p-4 bg-white/90 rounded-lg shadow-md border border-purple-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">Countries (Ctrl/Cmd+click to select multiple)</label>
                <select
                  multiple
                  value={editCountries}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setEditCountries(selected);
                  }}
                  className="w-full border rounded p-2 mb-2 h-48"
                >
                  <option value="">Select a country...</option>
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
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingCountries(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={() => { updateHikeMutation.mutate({ countries: editCountries }); setIsEditingCountries(false); }} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">Save</button>
                </div>
              </div>
            )}

          <div className="mt-2">
            {isEditingUrl ? (
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="border rounded p-1 w-full max-w-md"
                  placeholder="https://www.alltrails.com/..."
                />
                <button onClick={() => updateHikeMutation.mutate({ allTrailsUrl: editUrl })} className="text-green-600 hover:text-green-800 text-sm">Save</button>
                <button onClick={() => setIsEditingUrl(false)} className="text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {hike.allTrailsUrl ? (
                  <a href={hike.allTrailsUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-green-100 to-emerald-100 text-forest-dark px-4 py-2 rounded-full text-sm font-semibold shadow-md border border-green-300 hover:shadow-lg transition-shadow inline-block">
                    🏔️ View on AllTrails
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm italic">No AllTrails URL</span>
                )}
                <button onClick={() => setIsEditingUrl(true)} className="text-gray-400 hover:text-blue-600 text-sm">✎</button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this hike?')) {
              deleteHikeMutation.mutate();
            }
          }}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-4 rounded-lg shadow mb-6 dark:bg-gray-800 group relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold dark:text-white">Map</h2>
              {!isEditingMap && (
                <button onClick={() => setIsEditingMap(true)} className="text-gray-400 hover:text-blue-600">✎</button>
              )}
            </div>
            
            {isEditingMap ? (
              <div className="flex flex-col gap-2 mb-4">
                <input
                  type="file"
                  accept=".gpx"
                  onChange={handleGpxFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setIsEditingMap(false); setNewGpxContent(''); }} className="text-gray-500 hover:text-gray-700">Cancel</button>
                  <button 
                    onClick={() => {
                      if (newGpxContent) {
                        updateHikeMutation.mutate({ gpxContent: newGpxContent });
                      }
                    }} 
                    disabled={!newGpxContent}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save New Map
                  </button>
                </div>
              </div>
            ) : null}

            {hike.gpxContent ? (
              <MapComponent gpxContent={hike.gpxContent} />
            ) : (
              <p className="text-gray-500">No GPX data available.</p>
            )}
          </div>
          
          {hike.gpxContent && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Elevation Profile</h2>
              <ElevationChart gpxContent={hike.gpxContent} />
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 group relative">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold dark:text-white">Notes</h2>
              {!isEditingNotes && (
                <button onClick={() => setIsEditingNotes(true)} className="text-gray-400 hover:text-blue-600">✎</button>
              )}
            </div>
            {isEditingNotes ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full border rounded p-2 min-h-[100px]"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingNotes(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={() => updateHikeMutation.mutate({ description: editNotes })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{hike.description || <span className="italic text-gray-400">No notes added.</span>}</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 group relative mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold dark:text-white">🚆 Travel Logistics from Dublin</h2>
              <div className="flex gap-2">
                {!isEditingLogistics && !isGeneratingLogistics && (
                  <>
                    <button 
                      onClick={async () => {
                        try {
                          setIsGeneratingLogistics(true);
                          const res = await api.post(`/hikes/${id}/logistics`);
                          setEditLogistics(res.data);
                          // Auto-save the generated content
                          updateHikeMutation.mutate({ travelLogistics: res.data });
                        } catch (e) {
                          console.error('Failed to generate logistics', e);
                          alert('Failed to generate logistics. Please try again.');
                        } finally {
                          setIsGeneratingLogistics(false);
                        }
                      }}
                      disabled={isGeneratingLogistics}
                      className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGeneratingLogistics ? (
                        <>
                          <span className="animate-spin">⏳</span> Planning Trip...
                        </>
                      ) : (
                        <>✨ Auto-fill with AI</>
                      )}
                    </button>
                    <button onClick={() => setIsEditingLogistics(true)} className="text-gray-400 hover:text-blue-600">✎</button>
                  </>
                )}
              </div>
            </div>
            {isGeneratingLogistics ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin text-4xl">🌍</div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Planning your journey...</p>
                  <p className="text-sm text-gray-500">Analyzing routes from Dublin to {hike.title}</p>
                </div>
              </div>
            ) : isEditingLogistics ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editLogistics}
                  onChange={(e) => setEditLogistics(e.target.value)}
                  className="w-full border rounded p-2 min-h-[100px]"
                  placeholder="Nearest airports, bus/rail options..."
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingLogistics(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={() => updateHikeMutation.mutate({ travelLogistics: editLogistics })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                {hike.travelLogistics ? (
                  <>
                    <div className={`relative ${!isLogisticsExpanded ? 'max-h-60 overflow-hidden' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{hike.travelLogistics}</ReactMarkdown>
                      {!isLogisticsExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                      )}
                    </div>
                    <button
                      onClick={() => setIsLogisticsExpanded(!isLogisticsExpanded)}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                    >
                      {isLogisticsExpanded ? 'Show Less' : 'Show More'} {isLogisticsExpanded ? '↑' : '↓'}
                    </button>
                  </>
                ) : (
                  <span className="italic text-gray-400">No logistics info added.</span>
                )}
              </div>
            )}

          </div>

          <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800 group relative mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold dark:text-white">🛖⛺ Huts and Wildcamping</h2>
              <div className="flex gap-2">
                {!isEditingAccommodation && !isGeneratingAccommodation && (
                  <>
                    <button 
                      onClick={async () => {
                        try {
                          setIsGeneratingAccommodation(true);
                          const res = await api.post(`/hikes/${id}/accommodation`);
                          setEditAccommodation(res.data);
                          // Auto-save the generated content
                          updateHikeMutation.mutate({ accommodation: res.data });
                        } catch (e) {
                          console.error('Failed to generate accommodation info', e);
                          alert('Failed to generate accommodation info. Please try again.');
                        } finally {
                          setIsGeneratingAccommodation(false);
                        }
                      }}
                      disabled={isGeneratingAccommodation}
                      className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGeneratingAccommodation ? (
                        <>
                          <span className="animate-spin">⏳</span> Researching...
                        </>
                      ) : (
                        <>✨ Auto-fill with AI</>
                      )}
                    </button>
                    <button onClick={() => setIsEditingAccommodation(true)} className="text-gray-400 hover:text-blue-600">✎</button>
                  </>
                )}
              </div>
            </div>
            {isGeneratingAccommodation ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin text-4xl">⛺</div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Finding places to stay...</p>
                  <p className="text-sm text-gray-500">Searching for huts and wildcamping spots near {hike.title}</p>
                </div>
              </div>
            ) : isEditingAccommodation ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editAccommodation}
                  onChange={(e) => setEditAccommodation(e.target.value)}
                  className="w-full border rounded p-2 min-h-[100px]"
                  placeholder="Huts, wildcamping rules, recommended spots..."
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingAccommodation(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={() => updateHikeMutation.mutate({ accommodation: editAccommodation })} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                {hike.accommodation ? (
                  <>
                    <div className={`relative ${!isAccommodationExpanded ? 'max-h-60 overflow-hidden' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{hike.accommodation}</ReactMarkdown>
                      {!isAccommodationExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                      )}
                    </div>
                    <button
                      onClick={() => setIsAccommodationExpanded(!isAccommodationExpanded)}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                    >
                      {isAccommodationExpanded ? 'Show Less' : 'Show More'} {isAccommodationExpanded ? '↑' : '↓'}
                    </button>
                  </>
                ) : (
                  <span className="italic text-gray-400">No accommodation info added.</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Photos</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {hike.photos?.map((photo, index) => (
                <img key={index} src={photo} alt={`Hike photo ${index + 1}`} className="w-full h-48 object-cover rounded" />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add photo URL..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="flex-1 border rounded p-2"
              />
              <button
                onClick={() => {
                  if (photoUrl) addPhotoMutation.mutate(photoUrl);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
