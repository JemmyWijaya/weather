'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MapPin, AlertCircle } from 'lucide-react';
import { LOCAL_STORAGE_KEY, MAX_SAVED_LOCATIONS, WEATHER_API } from '../../lib/weather-utils';
import SavedLocationItem from './SavedLocationItem';

interface SavedLocationSectionProps {
  onOpenSearch: () => void;
}

export const SavedLocationSection: React.FC<SavedLocationSectionProps> = ({ onOpenSearch }) => {
  const [saved, setSaved] = useState<SavedLocationItem[]>([]);
  const [loadingTemps, setLoadingTemps] = useState<boolean>(false);
  const [storageAvailable, setStorageAvailable] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const isLocalStorageAvailable = useCallback((): boolean => {
    try {
      const testKey = '__test_ls__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }, []);

  const enrichWithWeather = async (items: SavedLocationItem[]): Promise<SavedLocationItem[]> => {
    if (items.length === 0) return items;
    setLoadingTemps(true);
    try {
      const enriched = await Promise.all(
        items.map(async (item) => {
          try {
            const res = await fetch(
              `${WEATHER_API}?latitude=${item.latitude}&longitude=${item.longitude}&current=temperature_2m,weather_code&timezone=auto`
            );
            if (!res.ok) return item;
            const data = await res.json();
            return {
              ...item,
              temp: Math.round(data.current?.temperature_2m),
              weatherCode: data.current?.weather_code,
            };
          } catch {
            return item;
          }
        })
      );
      return enriched;
    } finally {
      setLoadingTemps(false);
    }
  };

  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      setStorageAvailable(false);
      return;
    }

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: SavedLocationItem[] = JSON.parse(stored);
        setSaved(parsed);
        enrichWithWeather(parsed).then((enriched) => setSaved(enriched));
      }
    } catch {
      setErrorNotice('Could not load saved locations from your browser storage.');
    }
  }, [isLocalStorageAvailable]);

  const handleRemove = (id: number) => {
    const updated = saved.filter((item) => item.id !== id);
    setSaved(updated);
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      setErrorNotice('Failed to update browser storage.');
    }
  };

  if (!storageAvailable) {
    return (
      <div className="w-full bg-slate-900/30 border border-slate-800 rounded-2xl p-4 text-left flex items-center gap-3 text-slate-400 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{'Browser storage is disabled or blocked. Saved locations cannot be stored.'}</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4 text-left">
      {errorNotice && (
        <div className="p-3 text-xs text-red-300 bg-red-950/20 border border-red-500/20 rounded-xl">
          {errorNotice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {saved.map((item) => (
          <SavedLocationItem
            key={item.id}
            item={item}
            onRemove={handleRemove}
            isLoadingWeather={loadingTemps}
          />
        ))}

        {saved.length === 0 ? (
          <div className="col-span-2 md:col-span-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-slate-800/50 rounded-full text-slate-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{'No saved locations'}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {'Save up to 4 favorite cities for quick one-click forecasts'}
              </p>
            </div>
            <button
              onClick={onOpenSearch}
              className="mt-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{'Add Location'}</span>
            </button>
          </div>
        ) : (
          saved.length < MAX_SAVED_LOCATIONS && (
            <button
              onClick={onOpenSearch}
              className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition h-32 sm:h-36 group cursor-pointer"
            >
              <div className="p-2 rounded-full bg-slate-800/60 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition mb-2">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">{'Add Location'}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};