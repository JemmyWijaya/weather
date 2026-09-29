import { GeoLocation } from "../../types/weather"

interface LocationSearchModalItemProps {
  loc: GeoLocation,
  onClick: () => void
}

export const LocationSearchModalItem: React.FC<LocationSearchModalItemProps> = ({loc, onClick}) => {

  return (
    <button
      key={loc.id}
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-md hover:bg-slate-800/60 active:bg-slate-800 transition flex flex-col group focus:outline-none focus:bg-slate-800/60 cursor-pointer"
    >
      <p className="text-sm sm:text-base font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
        {loc.name}
      </p>
      <p className="text-xs text-slate-400">
        {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
      </p>
    </button>
  );
};

export default LocationSearchModalItem;