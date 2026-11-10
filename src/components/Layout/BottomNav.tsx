import React from 'react';
import { Home, Scale, Clock } from 'lucide-react';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  currentTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'home' as ActiveTab,
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'compare' as ActiveTab,
      label: 'So sánh giá',
      icon: Scale,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Lịch sử',
      icon: Clock,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border/60 shadow-bottom-nav pb-[env(safe-area-inset-bottom,8px)] pt-2">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-brand-ruby font-bold'
                  : 'text-brand-charcoal/60 hover:text-brand-charcoal font-medium'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-full transition-transform duration-200 ${
                  isActive ? 'bg-rose-50 scale-110' : ''
                }`}
              >
                <Icon
                  className={`w-6 h-6 stroke-[2.2] transition-colors ${
                    isActive ? 'text-brand-ruby' : 'text-brand-charcoal/70'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-ruby" />
                )}
              </div>
              <span className={`text-xs sm:text-sm mt-0.5 tracking-tight ${isActive ? 'font-bold text-brand-dark' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
