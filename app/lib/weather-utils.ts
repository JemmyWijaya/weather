import { 
  Sun, Wind, CloudRain, Snowflake, CloudLightning 
} from 'lucide-react';
import { WeatherStateConfig } from '../types/weather';

export const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
export const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

export const LOCAL_STORAGE_KEY = 'nextweather_saved_locations';
export const MAX_SAVED_LOCATIONS = 4;

export const getWeatherState = (code: number): WeatherStateConfig => {
  if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-yellow-400' };
  if (code >= 1 && code <= 3) return { label: 'Cloudy', icon: Sun, color: 'text-slate-300' };
  if (code >= 45 && code <= 48) return { label: 'Fog', icon: Wind, color: 'text-slate-400' };
  if (code >= 51 && code <= 67) return { label: 'Rain', icon: CloudRain, color: 'text-blue-400' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: Snowflake, color: 'text-indigo-200' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: CloudRain, color: 'text-blue-500' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: CloudLightning, color: 'text-purple-400' };
  return { label: 'Unknown', icon: Sun, color: 'text-slate-200' };
};

export const formatHour = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDay = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export interface WeatherMoodTheme {
  primaryGlow: string;  
  secondaryGlow: string;  
  ambientTint: string;    
}

export const getWeatherMoodTheme = (code: number | null | undefined, isDay = 1): WeatherMoodTheme => {
  if (code === null || code === undefined) {
    // Default
    return {
      primaryGlow: 'bg-blue-600/20',
      secondaryGlow: 'bg-purple-600/20',
      ambientTint: 'from-slate-950 via-slate-950 to-slate-900',
    };
  }

  // Clear Sky
  if (code === 0) {
    return isDay
      ? {
          primaryGlow: 'bg-amber-400/25',
          secondaryGlow: 'bg-yellow-200/20',
          ambientTint: 'from-amber-950/20 via-slate-950 to-slate-950',
        }
      : {
          primaryGlow: 'bg-indigo-500/20',
          secondaryGlow: 'bg-blue-400/15',
          ambientTint: 'from-indigo-950/30 via-slate-950 to-slate-950',
        };
  }

  // Cloudy / Overcast 
  if (code >= 1 && code <= 3) {
    return {
      primaryGlow: 'bg-slate-400/20',
      secondaryGlow: 'bg-amber-300/15',
      ambientTint: 'from-slate-900/60 via-slate-950 to-slate-950',
    };
  }

  // Fog / Mist
  if (code >= 45 && code <= 48) {
    return {
      primaryGlow: 'bg-zinc-400/20',
      secondaryGlow: 'bg-teal-500/15',
      ambientTint: 'from-zinc-900/40 via-slate-950 to-slate-950',
    };
  }

  // Rain / Drizzle
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      primaryGlow: 'bg-cyan-500/25',
      secondaryGlow: 'bg-blue-600/30',
      ambientTint: 'from-cyan-950/25 via-blue-950/20 to-slate-950',
    };
  }

  // Snow / Freezing Rain 
  if (code >= 71 && code <= 77) {
    return {
      primaryGlow: 'bg-indigo-300/25',
      secondaryGlow: 'bg-sky-200/20',
      ambientTint: 'from-slate-900/60 via-indigo-950/20 to-slate-950',
    };
  }

  // Thunderstorm 
  if (code >= 95 && code <= 99) {
    return {
      primaryGlow: 'bg-purple-600/30',
      secondaryGlow: 'bg-violet-400/25',
      ambientTint: 'from-purple-950/30 via-slate-950 to-slate-950',
    };
  }

  return {
    primaryGlow: 'bg-blue-600/20',
    secondaryGlow: 'bg-purple-600/20',
    ambientTint: 'from-slate-950 via-slate-950 to-slate-900',
  };
};