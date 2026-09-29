'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Wind, Droplets, Thermometer, 
  CloudRain, Sunrise, Sunset, Eye, Loader2, 
  BookmarkCheck,
  Bookmark,
  Heart,
  HeartMinus
} from 'lucide-react';
import { WeatherApiResponse, HourlyChartData, DailyChartData } from '../types/weather';
import { WEATHER_API, getWeatherState, formatHour, formatDay, LOCAL_STORAGE_KEY, MAX_SAVED_LOCATIONS } from '../lib/weather-utils';
import { HourlyChart } from '../components/HourlyChart';
import { DailyPrecipitationChart } from '../components/DailyPrecipationChart';
import { useWeatherTheme } from '../context/WeatherThemeContext';
import SavedLocationItem from '../components/SavedLocationSection/SavedLocationItem';

function WeatherDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const name = searchParams.get('name') || 'Selected Location';
  const country = searchParams.get('country') || '';
  const admin1 = searchParams.get('admin1') || '';

  const [data, setData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { setWeatherMood } = useWeatherTheme();

  // Saved Location States
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Check if current location is already saved in LocalStorage
  const checkIsSaved = useCallback(() => {
    if (!lat || !lon) return;
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const list: SavedLocationItem[] = JSON.parse(stored);
        const match = list.some(
          (item) =>
            (item.name.toLowerCase() === name.toLowerCase() && item.country === country) ||
            (Math.abs(item.latitude - parseFloat(lat)) < 0.01 && Math.abs(item.longitude - parseFloat(lon)) < 0.01)
        );
        setIsSaved(match);
      } else {
        setIsSaved(false);
      }
    } catch {
      setIsSaved(false);
    }
  }, [lat, lon, name, country]);

  useEffect(() => {
    checkIsSaved();
  }, [checkIsSaved]);

  // Handle Save / Unsave Location Toggle
  const handleToggleSave = () => {
    if (!lat || !lon) return;

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const list: SavedLocationItem[] = stored ? JSON.parse(stored) : [];

      if (isSaved) {
        // Remove from saved
        const updated = list.filter(
          (item) =>
            !(
              (item.name.toLowerCase() === name.toLowerCase() && item.country === country) ||
              (Math.abs(item.latitude - parseFloat(lat)) < 0.01 && Math.abs(item.longitude - parseFloat(lon)) < 0.01)
            )
        );
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        setIsSaved(false);
        showToast('Removed from saved locations');
      } else {
        // Check maximum limit
        if (list.length >= MAX_SAVED_LOCATIONS) {
          showToast(`Limit reached: maximum ${MAX_SAVED_LOCATIONS} saved locations.`);
          return;
        }

        // Add new saved item
        const newItem: SavedLocationItem = {
          id: Date.now(),
          name,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          country,
          admin1,
          temp: data ? Math.round(data.current.temperature_2m) : undefined,
          weatherCode: data ? data.current.weather_code : undefined,
        };

        const updated = [...list, newItem];
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        setIsSaved(true);
        showToast('Added to saved locations');
      }
    } catch {
      showToast('Could not update browser storage.');
    }
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 2800);
  };

  useEffect(() => {
    if (!lat || !lon) {
      setError('Missing coordinates for this location.');
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data unavailable');
        const json: WeatherApiResponse = await response.json();
        setData(json);
        
        setWeatherMood(json.current.weather_code, json.current.is_day);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon, setWeatherMood]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400">{`Loading forecast for ${name}...`}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-400">{error || 'Something went wrong'}</p>
        <Link 
          href="/" 
          className="inline-block px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition"
        >
          {'Go Back'}
        </Link>
      </div>
    );
  }

  const current = data.current;
  const currState = getWeatherState(current.weather_code);
  const Icon = currState.icon;

  const currentHourIndex = data.hourly.time.findIndex(t => new Date(t) > new Date());
  const startIndex = Math.max(0, currentHourIndex === -1 ? 0 : currentHourIndex - 1);
  const hourlyData: HourlyChartData[] = data.hourly.time.slice(startIndex, startIndex + 12).map((time, i) => ({
    time: formatHour(time),
    temp: Math.round(data.hourly.temperature_2m[startIndex + i])
  }));

  const dailyData: DailyChartData[] = data.daily.time.map((time, i) => ({
    day: i === 0 ? 'Today' : formatDay(time),
    maxTemp: Math.round(data.daily.temperature_2m_max[i]),
    minTemp: Math.round(data.daily.temperature_2m_min[i]),
    precipProb: data.daily.precipitation_probability_max[i],
    code: data.daily.weather_code[i]
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2">
          <span>{saveToast}</span>
        </div>
      )}

      <div className="flex flex-col gap-5 items-start justify-between">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group rounded-md cursor-pointer text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{'Back to Home'}</span>
        </button>
        <div className="flex justify-between items-start w-full">
          <div className="flex gap-2 items-baseline">
            <MapPin className="w-5 h-5" />
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-white">
                {name}
              </h2>
              <p className="text-sm text-slate-400">
                {admin1 ? `${admin1}, ` : ''}{country}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleSave}
            title={isSaved ? 'Remove from Saved Locations' : 'Save Location'}
            aria-label={isSaved ? 'Remove from Saved Locations' : 'Save Location'}
            className={`flex items-center gap-1 cursor-pointer text-sm opacity-80 hover:opacity-100 transition-opacity`}
          >
            {isSaved ? (
              <>
                <Heart className="w-5 h-5 text-red-500/70" fill='color-red-500'/>
                <span className="hidden sm:inline text-red-500/70">{'Remove'}</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 text-slate-400" />
                <span className="hidden sm:inline">{'Save'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-md p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div>
              <p className="text-slate-400 font-medium mb-1">{'Current Weather'}</p>
              <div className="flex items-center gap-4">
                <Icon className={`w-16 h-16 sm:w-20 sm:h-20 ${currState.color} drop-shadow-lg`} />
                <div>
                  <div className="flex items-start">
                    <span className="text-7xl font-bold tracking-tighter">{Math.round(current.temperature_2m)}</span>
                    <span className="text-3xl font-semibold text-slate-400 mt-2">{'°C'}</span>
                  </div>
                  <p className="text-lg font-medium text-slate-300">{currState.label}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
              <div className="bg-slate-950/50 p-4 rounded-md border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Wind className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{'Wind'}</span>
                </div>
                <p className="text-xl font-semibold">{current.wind_speed_10m} <span className="text-sm text-slate-500">{'km/h'}</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-md border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{'Humidity'}</span>
                </div>
                <p className="text-xl font-semibold">{current.relative_humidity_2m}<span className="text-sm text-slate-500">{'%'}</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-md border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{'Feels Like'}</span>
                </div>
                <p className="text-xl font-semibold">{Math.round(current.apparent_temperature)}<span className="text-sm text-slate-500">{'°'}</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-md border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <CloudRain className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{'Precipation'}</span>
                </div>
                <p className="text-xl font-semibold">{current.precipitation}<span className="text-sm text-slate-500">{'mm'}</span></p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" /> {'12-Hour Temperature Trend'}
            </h3>
            <HourlyChart data={hourlyData} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="bg-slate-900/40 border border-slate-800 rounded-md p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-4">{'Sun & Moon'}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-md border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Sunrise className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-400">{'Sunrise'}</p>
                    <p className="font-semibold">{formatHour(data.daily.sunrise[0])}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-md border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Sunset className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-400">{'Sunset'}</p>
                    <p className="font-semibold">{formatHour(data.daily.sunset[0])}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-md p-6 backdrop-blur-sm shadow-xl flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 mb-2">{'7-Day Rain Probability'}</h3>
            <div className="flex-1 min-h-[200px]">
              <DailyPrecipitationChart data={dailyData}/>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-md p-6 backdrop-blur-sm shadow-xl">
        <h3 className="text-sm font-medium text-slate-400 mb-6">{'7-Day Forecast'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {dailyData.map((day, idx) => {
            const state = getWeatherState(day.code);
            const DayIcon = state.icon;
            return (
              <div key={idx} className="bg-slate-950/50 p-4 rounded-md border border-slate-800/50 flex flex-col  transition-colors">
                <p className="text-sm font-medium text-slate-300 mb-4">{day.day}</p>
                <div className="flex gap-2 items-center mb-2">
                  <DayIcon className={`w-6 h-6 ${state.color}`} />
                  <span className="text-sm">{state.label}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] items-center gap-1 gap-x-5 w-full">
                  <span className="text-xs text-slate-400">{'Hi'}</span>
                  <span className="text-xs text-slate-400">{'Low'}</span>
                  <span className="font-bold text-white">{day.maxTemp}{'°'}</span>
                  <span className="text-sm font-medium text-slate-400">{day.minTemp}{'°'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WeatherPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400">{'Loading...'}</p>
      </div>
    }>
      <WeatherDashboardContent />
    </Suspense>
  );
}