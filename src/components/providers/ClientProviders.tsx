"use client";

import React from 'react';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import LocalizationModal from '@/components/layout/LocalizationModal';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider>
      {children}
      <LocalizationModal />
    </LocalizationProvider>
  );
}
