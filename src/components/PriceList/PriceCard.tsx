import React from 'react';
import { PriceItem } from '../../types';
import { ChevronRight } from 'lucide-react';

interface Props {
  item: PriceItem;
  isSeniorMode?: boolean;
  onCardClick?: (item: PriceItem) => void;
}

export const PriceCard: React.FC<Props> = ({
  item,
  isSeniorMode = false,
  onCardClick,
}) => {
  return (
    <div
      onClick={() => onCardClick && onCardClick(item)}
      className="group relative w-full bg-white rounded-2xl p-3.5 sm:p-4 border border-brand-border/40 shadow-xs hover:shadow-card transition-all duration-150 active:scale-[0.99] flex items-center justify-between gap-2 cursor-pointer"
    >
      {/* Left Column: Battery Name (Single line, bold) */}
      <div className="flex items-center min-w-0 flex-1 mr-2">
        <h3
          className={`font-black text-brand-charcoal tracking-tight truncate ${
            isSeniorMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}
          title={item.batteryName}
        >
          {item.batteryName}
        </h3>
      </div>

      {/* Right Column: Price Pill (Pink badge with red bold text + chevron) */}
      <div className="flex items-center space-x-1.5 flex-shrink-0">
        <div className="inline-flex items-center bg-gradient-to-r from-rose-100 to-rose-200/80 text-brand-dark px-3.5 py-1.5 rounded-full shadow-xs border border-rose-300/50 group-hover:from-rose-200 group-hover:to-rose-300 transition-colors">
          <span
            className={`font-black tracking-tight ${
              isSeniorMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
            }`}
          >
            {item.formattedPrice}
          </span>
          <ChevronRight className="w-4 h-4 ml-1 text-brand-ruby/70 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
