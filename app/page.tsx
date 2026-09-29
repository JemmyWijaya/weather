'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Heart, Map } from 'lucide-react';
import { GeoLocation } from './types/weather';
import { CurrentLocationWeather } from './components/CurrentLocationWeather';
import { LOCAL_STORAGE_KEY, MAX_SAVED_LOCATIONS } from './lib/weather-utils';
import { LocationSearchModal } from './components/LocationSearchModal';
import SavedLocationItem from './components/SavedLocationSection/SavedLocationItem';
import { SavedLocationSection } from './components/SavedLocationSection';

export default function HomePage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchMode, setSearchMode] = useState<'navigate' | 'save'>('navigate');
  const [saveKeyTrigger, setSaveKeyTrigger] = useState(0);

  const openSearchToNavigate = () => {
    setSearchMode('navigate');
    setIsSearchOpen(true);
  };

  const openSearchToSave = () => {
    setSearchMode('save');
    setIsSearchOpen(true);
  };

   const handleSelectLocation = useCallback(
    (loc: GeoLocation) => {
      if (searchMode === 'save') {
        try {
          const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
          const currentList: SavedLocationItem[] = stored ? JSON.parse(stored) : [];

          const exists = currentList.some((item) => item.id === loc.id);
          if (!exists && currentList.length < MAX_SAVED_LOCATIONS) {
            const updated = [
              ...currentList,
              {
                id: loc.id,
                name: loc.name,
                latitude: loc.latitude,
                longitude: loc.longitude,
                country: loc.country || '',
                admin1: loc.admin1 || '',
              },
            ];
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            setSaveKeyTrigger((prev) => prev + 1); 
          }
        } catch (e) {
          console.error('LocalStorage write error:', e);
        }
      } else {
        const params = new URLSearchParams({
          lat: loc.latitude.toString(),
          lon: loc.longitude.toString(),
          name: loc.name,
          country: loc.country || '',
          admin1: loc.admin1 || '',
        });
        router.push(`/weather?${params.toString()}`);
      }
    },
    [searchMode, router]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {'Simple Weather App'}
        </h2>
        <p className="text-slate-400 text-md md:w-2/3">
          {'Get current weather conditions and detailed trend charts for locations around the world.'}
        </p>
      </div>

      <div className="w-full">
        <div className="flex items-center gap-2 text-gray-300 mb-3">
          <MapPin className="w-4 h-4 text-gray-300" />
          <span className="text-xs uppercase tracking-wider font-semibold">{'Your Location'}</span>
        </div>
        <CurrentLocationWeather />
      </div>
      
      <div className="w-full">
        <div className="flex items-center gap-2 text-gray-300 mb-3">
          <Map className="w-4 h-4 text-gray-300" />
          <span className="text-xs uppercase tracking-wider font-semibold">{'Explore More Locations'}</span>
        </div>
        <button
          type="button"
          onClick={openSearchToNavigate}
          className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-900/50 hover:bg-slate-900/70 border border-slate-700/50 hover:border-slate-600 rounded-md text-left text-base text-slate-400 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-xl transition-all shadow-2xl relative group cursor-pointer"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </div>
          <span>{'Search for a city (e.g., Tokyo, New York)...'}</span>
        </button>
      </div>

      <div className="w-full">
        <div className="flex items-center gap-2 text-gray-300 mb-3">
          <Heart className="w-4 h-4 text-gray-300" />
          <span className="text-xs uppercase tracking-wider font-semibold">{'Saved Locations'}</span>
        </div>
        <SavedLocationSection
          key={saveKeyTrigger}
          onOpenSearch={openSearchToSave}
        />
      </div>

      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}