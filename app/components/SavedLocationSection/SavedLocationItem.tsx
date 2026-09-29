import { Loader2, Trash2 } from "lucide-react";
import { getWeatherState } from "../../lib/weather-utils";
import { useRouter } from 'next/navigation';


export interface SavedLocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  temp?: number;
  weatherCode?: number;
}

interface SavedLocationItemProps {
  item: SavedLocationItem,
  onRemove: (id: number) => void;
  isLoadingWeather?: boolean;
}

export const SavedLocationItem: React.FC<SavedLocationItemProps> = ({item, onRemove, isLoadingWeather}) => {
    const router = useRouter();
    const stateConfig = item.weatherCode !== undefined ? getWeatherState(item.weatherCode) : null;
    const StateIcon = stateConfig?.icon;
    
    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(item.id);
    };

    const handleNavigate = () => {
      const params = new URLSearchParams({
        lat: item.latitude.toString(),
        lon: item.longitude.toString(),
        name: item.name,
        country: item.country || '',
        admin1: item.admin1 || '',
      });
      router.push(`/weather?${params.toString()}`);
    };
    
    return (
      <div
        key={item.id}
        onClick={handleNavigate}
        className="group relative bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-md p-3 sm:p-4 backdrop-blur-sm transition-all cursor-pointer flex flex-col justify-between h-32 sm:h-36 shadow-lg"
      >
        <button
          onClick={handleRemoveClick}
          className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition cursor-pointer"
          title="Remove location"
          aria-label="Remove location"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div>
          <p className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate pr-6">
            {item.name}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
          <div>
            {isLoadingWeather && item.temp === undefined ? (
              <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
            ) : item.temp !== undefined ? (
              <span className="text-2xl font-bold text-white tracking-tight">
                {item.temp}{'°'}
              </span>
            ) : (
              <span className="text-xs text-slate-500">{'--'}</span>
            )}
          </div>

          {StateIcon && (
            <div className="flex gap-2 items-center">
              <StateIcon className={`w-5 h-5 ${stateConfig?.color || 'text-slate-400'}`} />
              <span className="text-sm text-slate-400">{stateConfig.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

export default SavedLocationItem;