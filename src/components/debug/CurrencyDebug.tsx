"use client";

import { useLocalization } from '@/contexts/LocalizationContext';

export default function CurrencyDebug() {
  const { currency, exchangeRate, convertPrice } = useLocalization();
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'black', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999 
    }}>
      <div>Currency: {currency}</div>
      <div>Rate: {exchangeRate}</div>
      <div>Test (10000): {convertPrice(10000)}</div>
    </div>
  );
}
