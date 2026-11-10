import React from 'react';
import { Supplier, SupplierId } from '../../types';
import { BatteryIllustration } from './BatteryIllustration';
import { UploadActionButton } from './UploadActionButton';
import { QuickSupplierCards } from './QuickSupplierCards';

interface Props {
  suppliers: Record<SupplierId, Supplier>;
  onSelectSupplier: (id: SupplierId) => void;
  onFilesSelected: (files: File[]) => void;
  mostRecentDate: string;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
}

export const HomeView: React.FC<Props> = ({
  suppliers,
  onSelectSupplier,
  onFilesSelected,
  mostRecentDate,
  isAdmin = true,
  onRequireAdmin,
}) => {
  return (
    <div className="w-full pb-28 space-y-6 flex flex-col items-center">
      {/* 3D Battery Illustration with Leaves */}
      <div className="pt-2">
        <BatteryIllustration size="md" />
      </div>

      {/* Slogan */}
      <div className="text-center px-4 -mt-2">
        <p className="text-sm sm:text-base font-bold text-stone-600 tracking-wide">
          "Nhanh chóng • Chính xác • Dễ sử dụng"
        </p>
      </div>

      {/* Big Action Upload Button (supports multi-image) */}
      <div className="w-full px-1">
        <UploadActionButton 
          onFilesSelected={onFilesSelected} 
          isAdmin={isAdmin}
          onRequireAdmin={onRequireAdmin}
        />
      </div>

      {/* Quick Access to the 3 Suppliers */}
      <div className="w-full px-1">
        <QuickSupplierCards
          suppliers={suppliers}
          onSelectSupplier={onSelectSupplier}
          mostRecentDate={mostRecentDate}
        />
      </div>
    </div>
  );
};
