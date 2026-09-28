'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, MapPin, Wind, Droplets, Sun, Moon, 
  ArrowLeft, Loader2, CloudRain, Thermometer, 
  Eye, Sunrise, Sunset, CloudLightning, Snowflake
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';


// API Base URLs
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// Weather code mapping to generic states
const getWeatherState = (code) => {
  if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-yellow-400' };
  if (code >= 1 && code <= 3) return { label: 'Cloudy', icon: Sun, color: 'text-slate-300' }; // simplified for daytime
  if (code >= 45 && code <= 48) return { label: 'Fog', icon: Wind, color: 'text-slate-400' };
  if (code >= 51 && code <= 67) return { label: 'Rain', icon: CloudRain, color: 'text-blue-400' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: Snowflake, color: 'text-indigo-200' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: CloudRain, color: 'text-blue-500' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: CloudLightning, color: 'text-purple-400' };
  return { label: 'Unknown', icon: Sun, color: 'text-slate-200' };
};

// Formatter for hour strings
const formatHour = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Formatter for day names
const formatDay = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};


// A simple router context to simulate Next.js routing in a single file
const RouterContext = React.createContext();

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>
      
      <header className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              NextWeather
            </h1>
          </div>
          <nav className="text-sm font-medium text-slate-400">
            Recharts Integration
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};


const Home = () => {
  const { navigate } = React.useContext(RouterContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const fetchLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${GEO_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        setError('Failed to fetch locations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc) => {
    navigate('/weather', {
      lat: loc.latitude,
      lon: loc.longitude,
      name: loc.name,
      country: loc.country || '',
      admin1: loc.admin1 || ''
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Global Weather, <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Beautifully Visualized.
          </span>
        </h2>
        <p className="text-slate-400 text-lg">
          Enter a city name to get real-time weather conditions and detailed trend charts powered by Recharts.
        </p>
      </div>

      <div className="w-full relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-xl transition-all shadow-2xl"
            placeholder="Search for a city (e.g., Tokyo, New York)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="absolute mt-2 w-full bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-700/50">
            {results.map((loc) => (
              <button
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className="w-full text-left px-6 py-4 hover:bg-slate-700/50 transition-colors flex flex-col items-start focus:outline-none focus:bg-slate-700/50"
              >
                <span className="font-semibold text-slate-100">{loc.name}</span>
                <span className="text-sm text-slate-400">
                  {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-slate-300 text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const HourlyChart = ({ data }) => {
  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="temp" 
            name="Temperature"
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
            unit="°C"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const DailyPrecipChart = ({ data }) => {
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.4}}/>
          <Bar 
            dataKey="precipProb" 
            name="Precipitation Chance"
            fill="#8b5cf6" 
            radius={[4, 4, 0, 0]}
            unit="%"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


const WeatherDashboard = ({ location }) => {
  const { navigate } = React.useContext(RouterContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Fetch Current, Hourly (24h), and Daily (7d)
        const url = `${WEATHER_API}?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data unavailable');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400">Loading forecast for {location.name}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-400">{error || 'Something went wrong'}</p>
        <button 
          onClick={() => navigate('/', null)}
          className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- Data Processing ---
  const current = data.current;
  const currState = getWeatherState(current.weather_code);
  const Icon = currState.icon;

  // Process next 24 hours for AreaChart
  const currentHourIndex = data.hourly.time.findIndex(t => new Date(t) > new Date()) || 0;
  const startIndex = Math.max(0, currentHourIndex - 1);
  const hourlyData = data.hourly.time.slice(startIndex, startIndex + 24).map((time, i) => ({
    time: formatHour(time),
    temp: Math.round(data.hourly.temperature_2m[startIndex + i])
  }));

  // Process 7 days for BarChart & List
  const dailyData = data.daily.time.map((time, i) => ({
    day: i === 0 ? 'Today' : formatDay(time),
    maxTemp: Math.round(data.daily.temperature_2m_max[i]),
    minTemp: Math.round(data.daily.temperature_2m_min[i]),
    precipProb: data.daily.precipitation_probability_max[i],
    code: data.daily.weather_code[i]
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Navigation / Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/', null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Search</span>
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 justify-end">
            <MapPin className="w-5 h-5 text-blue-400" />
            {location.name}
          </h2>
          <p className="text-sm text-slate-400">
            {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Current Weather Card (Span 8) */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-slate-400 font-medium mb-1">Current Weather</p>
              <div className="flex items-center gap-4">
                <Icon className={`w-16 h-16 sm:w-20 sm:h-20 ${currState.color} drop-shadow-lg`} />
                <div>
                  <div className="flex items-start">
                    <span className="text-7xl font-bold tracking-tighter">{Math.round(current.temperature_2m)}</span>
                    <span className="text-3xl font-semibold text-slate-400 mt-2">°C</span>
                  </div>
                  <p className="text-lg font-medium text-slate-300">{currState.label}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Wind className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Wind</span>
                </div>
                <p className="text-xl font-semibold">{current.wind_speed_10m} <span className="text-sm text-slate-500">km/h</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Humidity</span>
                </div>
                <p className="text-xl font-semibold">{current.relative_humidity_2m}<span className="text-sm text-slate-500">%</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Feels Like</span>
                </div>
                <p className="text-xl font-semibold">{Math.round(current.apparent_temperature)}<span className="text-sm text-slate-500">°</span></p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <CloudRain className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Precip</span>
                </div>
                <p className="text-xl font-semibold">{current.precipitation}<span className="text-sm text-slate-500">mm</span></p>
              </div>
            </div>
          </div>

          {/* Recharts Hourly Trend inside Hero */}
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" /> 24-Hour Temperature Trend
            </h3>
            <HourlyChart data={hourlyData} />
          </div>
        </div>

        {/* Sidebar (Span 4) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Sun Cycle Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Sun & Moon</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Sunrise className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-xs text-slate-400">Sunrise</p>
                    <p className="font-semibold">{formatHour(data.daily.sunrise[0])}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Sunset className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-400">Sunset</p>
                    <p className="font-semibold">{formatHour(data.daily.sunset[0])}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Precipitation Chart */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex-1 flex flex-col">
             <h3 className="text-sm font-medium text-slate-400 mb-2">7-Day Rain Probability</h3>
             <div className="flex-1 min-h-[200px]">
                <DailyPrecipChart data={dailyData} />
             </div>
          </div>

        </div>
      </div>

      {/* 7-Day Forecast List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
        <h3 className="text-sm font-medium text-slate-400 mb-6">7-Day Forecast</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {dailyData.map((day, idx) => {
            const DayIcon = getWeatherState(day.code).icon;
            const dayColor = getWeatherState(day.code).color;
            return (
              <div key={idx} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center text-center hover:bg-slate-800/50 transition-colors">
                <p className="text-sm font-medium text-slate-300 mb-3">{day.day}</p>
                <DayIcon className={`w-8 h-8 ${dayColor} mb-3`} />
                <div className="flex items-center gap-3 w-full justify-center">
                  <span className="font-bold text-white">{day.maxTemp}°</span>
                  <span className="text-sm font-medium text-slate-500">{day.minTemp}°</span>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-blue-400/70" /> {day.precipProb}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  );
};


export default function App() {
  // Simple internal router state
  const [route, setRoute] = useState({ path: '/', state: null });

  // Navigation controller
  const navigate = useCallback((path, state = null) => {
    setRoute({ path, state });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    route, navigate
  }), [route, navigate]);

  return (
    <RouterContext.Provider value={contextValue}>
      <Layout>
        {route.path === '/' && <Home />}
        {route.path === '/weather' && <WeatherDashboard location={route.state} />}
      </Layout>
    </RouterContext.Provider>
  );
}