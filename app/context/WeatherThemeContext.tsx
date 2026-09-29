'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { getWeatherMoodTheme, WeatherMoodTheme } from '../lib/weather-utils';

interface WeatherThemeContextType {
  setWeatherMood: (weatherCode: number | null, isDay?: number) => void;
  theme: WeatherMoodTheme;
}

const WeatherThemeContext = createContext<WeatherThemeContextType | null>(null);

export const WeatherThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCode, setCurrentCode] = useState<number | null>(null);
  const [isDay, setIsDay] = useState<number>(1);

  const setWeatherMood = (code: number | null, day = 1) => {
    setCurrentCode(code);
    setIsDay(day);
  };

  const theme = useMemo(() => getWeatherMoodTheme(currentCode, isDay), [currentCode, isDay]);

  return (
    <WeatherThemeContext.Provider value={{ setWeatherMood, theme }}>
      <div className={`fixed inset-0 bg-gradient-to-b ${theme.ambientTint} transition-colors duration-1000 pointer-events-none -z-10`} />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${theme.primaryGlow} blur-[140px] rounded-full transition-all duration-1000 ease-out`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${theme.secondaryGlow} blur-[140px] rounded-full transition-all duration-1000 ease-out`}
        />
      </div>

      {children}
    </WeatherThemeContext.Provider>
  );
};

export const useWeatherTheme = () => {
  const context = useContext(WeatherThemeContext);
  if (!context) {
    throw new Error('useWeatherTheme must be used within a WeatherThemeProvider');
  }
  return context;
};