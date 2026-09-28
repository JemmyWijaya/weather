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