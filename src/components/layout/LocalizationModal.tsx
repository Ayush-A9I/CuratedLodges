"use client";

import React, { useState } from 'react';
import { X, Globe, DollarSign, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalization } from '@/contexts/LocalizationContext';
import styles from './LocalizationModal.module.css';

const LANGUAGES = [
  { code: 'en', name: 'English (United States)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (United Kingdom)', flag: '🇬🇧' },
  { code: 'es', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (Deutschland)', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
];

export default function LocalizationModal() {
  const { language, currency, setLanguage, setCurrency, isModalOpen, setIsModalOpen } = useLocalization();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language');

  if (!isModalOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
          <X size={24} />
        </button>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'language' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('language')}
          >
            <Globe size={20} />
            {t('modal.language')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'currency' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('currency')}
          >
            <DollarSign size={20} />
            {t('modal.currency')}
          </button>
        </div>

        {activeTab === 'language' ? (
          <div className={styles.optionsGrid}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`${styles.optionCard} ${language === lang.code ? styles.selected : ''}`}
                onClick={() => {
                  setLanguage(lang.code);
                  setTimeout(() => setIsModalOpen(false), 300);
                }}
              >
                <span className={styles.flag}>{lang.flag}</span>
                <span className={styles.optionName}>{lang.name}</span>
                {language === lang.code && (
                  <Check size={20} className={styles.checkIcon} />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.optionsGrid}>
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                className={`${styles.optionCard} ${currency === curr.code ? styles.selected : ''}`}
                onClick={() => {
                  setCurrency(curr.code);
                  setTimeout(() => setIsModalOpen(false), 300);
                }}
              >
                <span className={styles.currencySymbol}>{curr.symbol}</span>
                <span className={styles.optionName}>
                  {curr.name} ({curr.code})
                </span>
                {currency === curr.code && (
                  <Check size={20} className={styles.checkIcon} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
