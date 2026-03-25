"use client";

import React from 'react';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import LocalizationModal from '@/components/layout/LocalizationModal';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocalizationProvider>
      <AuthProvider>
        {children}
        <LocalizationModal />
      </AuthProvider>
    </LocalizationProvider>
  );
}
