"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import i18n from '@/i18n/config';

interface LocalizationContextType {
  language: string;
  currency: string;
  exchangeRate: number;
  exchangeRateUnavailable: boolean;
  setLanguage: (lang: string) => void;
  setCurrency: (curr: string) => void;
  convertPrice: (price: number) => string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isLoading: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const API_KEY = 'f95dd9d65a222232f37116a1';
const EXCHANGE_RATE_API = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/INR`;

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [currency, setCurrencyState] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [exchangeRateUnavailable, setExchangeRateUnavailable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('junglore_language');
    const savedCurrency = localStorage.getItem('junglore_currency');

    if (savedLanguage) {
      setLanguageState(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
      fetchExchangeRate(savedCurrency);
    }
  }, []);

  const fetchExchangeRate = async (targetCurrency: string) => {
    if (targetCurrency === 'INR') {
      setExchangeRate(1);
      setExchangeRateUnavailable(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(EXCHANGE_RATE_API);
      if (response.data.result === 'success') {
        const rate = response.data.conversion_rates[targetCurrency];
        setExchangeRate(rate || 1);
        setExchangeRateUnavailable(false);
      } else {
        setExchangeRateUnavailable(true);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Keep existing fallback: retain amounts at exchangeRate=1, no crash (Req 15.3)
      setExchangeRate(1);
      setExchangeRateUnavailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('junglore_language', lang);
    i18n.changeLanguage(lang);
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem('junglore_currency', curr);
    fetchExchangeRate(curr);
  };

  const convertPrice = (price: number): string => {
    const converted = price * exchangeRate;
    const formatted = `${getCurrencySymbol(currency)}${converted.toLocaleString(getLocale(language), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
    return formatted;
  };

  const getCurrencySymbol = (curr: string): string => {
    const symbols: { [key: string]: string } = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AUD: 'A$',
      CAD: 'C$',
      JPY: '¥',
      CNY: '¥',
      CHF: 'Fr',
      SGD: 'S$',
      AED: 'AED ',
      THB: '฿',
      MYR: 'RM',
    };
    return symbols[curr] || curr + ' ';
  };

  const getLocale = (lang: string): string => {
    const locales: { [key: string]: string } = {
      'en': 'en-US',
      'en-GB': 'en-GB',
      'es': 'es-ES',
      'es-MX': 'es-MX',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'pt-BR': 'pt-BR',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'hi': 'hi-IN',
    };
    return locales[lang] || 'en-US';
  };

  return (
    <LocalizationContext.Provider
      value={{
        language,
        currency,
        exchangeRate,
        exchangeRateUnavailable,
        setLanguage,
        setCurrency,
        convertPrice,
        isModalOpen,
        setIsModalOpen,
        isLoading,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};
