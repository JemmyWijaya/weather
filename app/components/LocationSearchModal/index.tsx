'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, MapPin, AlertCircle } from 'lucide-react';
import { GeoLocation } from '../../types/weather';
import { GEO_API } from '../../lib/weather-utils';
import LocationSearchModalItem from './LocationSearchModalItem';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (location: GeoLocation) => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
      setError(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${GEO_API}?name=${encodeURIComponent(query)}&count=7&language=en&format=json`
        );
        if (!res.ok) throw new Error('Failed to fetch locations');
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setError('Unable to load locations. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 350);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (loc: GeoLocation) => {
    if (onSelectLocation) {
      onSelectLocation(loc);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
      />

      <div 
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full sm:max-w-xl max-h-[85vh] sm:max-h-[620px] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center justify-between pb-3 sm:pb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              {'Find Location'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              className="w-full pl-11 pr-10 py-3 bg-slate-950/60 border border-slate-700/70 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="Search city (e.g. Jakarta, London, Tokyo)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading ? (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              </div>
            ) : query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 sm:p-3 min-h-[220px]">
          {error && (
            <div className="flex items-center gap-2 p-4 text-red-400 text-sm bg-red-950/20 rounded-xl m-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{}</span>
            </div>
          )}

          {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">{`No places found matching &ldquo;${query}&rdquo;`}</p>
              <p className="text-xs text-slate-500 mt-1">{'Try checking the spelling or search another city'}</p>
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="text-center py-14 text-slate-500">
              <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm">{'Type at least 2 characters to search'}</p>
            </div>
          )}

          {results.map((loc) => (
            <LocationSearchModalItem key={loc.id} onClick={() => handleSelect(loc)} loc={loc}/>
          ))}
        </div>

        <div className="px-4 py-3 bg-slate-950/40 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
          <span className="hidden sm:inline">{'Press Esc to close'}</span>
        </div>
      </div>
    </div>
  );
};