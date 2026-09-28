import { LucideIcon } from 'lucide-react';

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface WeatherApiResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability_max: number[];
  };
}

export interface HourlyChartData {
  time: string;
  temp: number;
}

export interface DailyChartData {
  day: string;
  maxTemp: number;
  minTemp: number;
  precipProb: number;
  code: number;
}

export interface WeatherStateConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}
