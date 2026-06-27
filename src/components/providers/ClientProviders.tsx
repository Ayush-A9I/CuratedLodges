"use client";

import React from 'react';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import LocalizationModal from '@/components/layout/LocalizationModal';
import AuthLocalizationSync from '@/components/providers/AuthLocalizationSync';
import ScrollToTop from '@/components/providers/ScrollToTop';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <AuthLocalizationSync />
        <ScrollToTop />
        {children}
        <LocalizationModal />
      </AuthProvider>
    </LocalizationProvider>
  );
}
