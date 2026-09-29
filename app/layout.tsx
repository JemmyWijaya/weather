import type { Metadata } from 'next';
import { Sun } from 'lucide-react';
import Link from 'next/link';
import './globals.css';
import { WeatherThemeProvider } from './context/WeatherThemeContext';

export const metadata: Metadata = {
  title: 'Jemmy Weather App',
  description: 'Get current weather conditions and detailed trend charts for locations around the world.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
        <WeatherThemeProvider>
          <header className="relative z-100 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                  {'Jemmy Weather App'}
                </span>
              </Link>
            </div>
          </header>

          <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </WeatherThemeProvider>
      </body>
    </html>
  );
}