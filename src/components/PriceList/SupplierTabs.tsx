import React from 'react';
import { SupplierId, Supplier } from '../../types';

interface Props {
  activeSupplier: SupplierId;
  suppliers: Record<SupplierId, Supplier>;
  onSelectSupplier: (id: SupplierId) => void;
}

export const SupplierTabs: React.FC<Props> = ({
  activeSupplier,
  suppliers,
  onSelectSupplier,
}) => {
  const tabs: SupplierId[] = ['nguyen', 'ngoc', 'nhung'];

  return (
    <div className="w-full bg-stone-100/90 p-1.5 rounded-2xl flex items-center shadow-inner">
      {tabs.map(tabId => {
        const isActive = activeSupplier === tabId;
        const supplier = suppliers[tabId];

        // Custom active pill styles per supplier
        const activeStyles = {
          nguyen: 'bg-brand-ruby text-white shadow-md',
          ngoc: 'bg-amber-600 text-white shadow-md',
          nhung: 'bg-purple-600 text-white shadow-md',
        }[tabId];

        return (
          <button
            key={tabId}
            onClick={() => onSelectSupplier(tabId)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 active:scale-95 text-center truncate ${
              isActive
                ? activeStyles
                : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-stone-200/60'
            }`}
          >
            {supplier?.name || tabId}
          </button>
        );
      })}
    </div>
  );
};
