'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Navigation, Loader2, AlertCircle, 
  Wind, Droplets, Thermometer, ChevronRight, RefreshCw 
} from 'lucide-react';
import { WEATHER_API, getWeatherState } from '../lib/weather-utils';

interface CurrentWeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const CurrentLocationWeather: React.FC = () => {
  const router = useRouter();
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [status, setStatus] = useState<'idle' | 'prompt' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchCityName = async (lat: number, lon: number): Promise<{ name: string; country: string }> => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      return {
        name: data.city || data.locality || data.principalSubdivision || 'Your Location',
        country: data.countryName || ''
      };
    } catch {
      return { name: 'Your Location', country: '' };
    }
  };

  const fetchWeatherForCoords = useCallback(async (lat: number, lon: number) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      // 1. Fetch reverse-geocoded name and current weather concurrently
      const [cityInfo, weatherRes] = await Promise.all([
        fetchCityName(lat, lon),
        fetch(
          `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        )
      ]);

      if (!weatherRes.ok) {
        throw new Error('Unable to retrieve weather for your location.');
      }

      const weatherJson = await weatherRes.json();
      const cur = weatherJson.current;

      setWeather({
        temp: Math.round(cur.temperature_2m),
        feelsLike: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        windSpeed: cur.wind_speed_10m,
        weatherCode: cur.weather_code,
        cityName: cityInfo.name,
        country: cityInfo.country,
        latitude: lat,
        longitude: lon
      });
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch weather.');
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setStatus('error');
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage('Location permission denied. Please enable it in browser settings.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setErrorMessage('Location information is unavailable.');
        } else if (err.code === err.TIMEOUT) {
          setErrorMessage('Location request timed out.');
        } else {
          setErrorMessage('An error occurred getting your position.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [fetchWeatherForCoords]);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          requestLocation();
        } else {
          setStatus('prompt');
        }

        result.onchange = () => {
          if (result.state === 'granted') {
            requestLocation();
          } else if (result.state === 'denied') {
            setStatus('error');
            setErrorMessage('Location permission denied.');
          }
        };
      }).catch(() => {
        setStatus('prompt');
      });
    } else {
      setStatus('prompt');
    }
  }, [requestLocation]);

  const handleCardClick = () => {
    if (!weather) return;
    const params = new URLSearchParams({
      lat: weather.latitude.toString(),
      lon: weather.longitude.toString(),
      name: weather.cityName,
      country: weather.country,
    });
    router.push(`/weather?${params.toString()}`);
  };

  if (status === 'prompt') {
    return (
      <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-left transition-all">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">{'Local Weather'}</h4>
            <p className="text-xs text-slate-400">{'Enable location to view real-time conditions for your area'}</p>
          </div>
        </div>
        <button
          onClick={requestLocation}
          className="mt-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <span>{'Enable Location'}</span>
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        <span className="text-sm text-slate-400">{'Detecting local weather...'}</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full bg-red-950/20 border border-red-500/30 rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-xs sm:text-sm text-red-300">{errorMessage}</p>
        </div>
        <button
          onClick={requestLocation}
          className="w-full sm:w-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{'Retry'}</span>
        </button>
      </div>
    );
  }

  if (status === 'success' && weather) {
    const weatherConfig = getWeatherState(weather.weatherCode);
    const WeatherIcon = weatherConfig.icon;

    return (
      <div 
        onClick={handleCardClick}
        className="w-full bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl transition-all cursor-pointer group text-left relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-3 items-center gap-4">
            <WeatherIcon className={`w-12 h-12 sm:w-14 sm:h-14 ${weatherConfig.color} drop-shadow-md shrink-0`} />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {weather.temp}{'°C'}
                </span>
                <span className="text-sm font-medium text-slate-300">
                  {weatherConfig.label}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mt-1">
                {weather.cityName}{weather.country ? `, ${weather.country}` : ''}
              </h3>
            </div>
          </div>

          <div className="flex flex-2 items-stretch gap-2 sm:gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t border-slate-800/60 sm:border-t-0">
            <div className="flex flex-1 justify-between flex-col p-2 bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase">
                <Thermometer className="w-3 h-3" />
                <span>{'Feels'}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 md:text-right">{weather.feelsLike}{'°'}</p>
            </div>

            <div className="flex flex-1 justify-between flex-col p-2 bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase">
                <Wind className="w-3 h-3" />
                <span>{'Wind'}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 md:text-right">{weather.windSpeed} <span className="text-[10px] text-slate-500 font-normal">{'km/h'}</span></p>
            </div>

            <div className="flex flex-1 justify-between flex-col p-2 bg-slate-950/40 rounded-xl border border-slate-800/40 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase">
                <Droplets className="w-3 h-3" />
                <span>{'Humid'}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 md:text-right">{weather.humidity}{'%'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-blue-400 lg:justify-end mt-3">
          <span>{'See forecast detail'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return null;
};