"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import styles from './SearchBox.module.css';

interface Park {
  slug: string;
  name: string;
}

interface SearchBoxProps {
  initialRegion?: string;
  initialPark?: string;
  compact?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ initialRegion = '', initialPark = '', compact = false }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedPark, setSelectedPark] = useState<string>(initialPark);
  const [parks, setParks] = useState<Park[]>([]);
  const { t } = useTranslation();

  // Update state when props change
  useEffect(() => {
    setSelectedRegion(initialRegion);
    setSelectedPark(initialPark);
  }, [initialRegion, initialPark]);

  const regions = [
    { value: 'india', label: 'India' },
    { value: 'africa', label: 'Africa' }
  ];

  // Fetch parks when region changes
  useEffect(() => {
    if (!selectedRegion) {
      setParks([]);
      return;
    }
    api.getParksByRegion(selectedRegion)
      .then((data) => {
        const parkList = (data.parks || []).map((p: any) => ({
          slug: p.slug,
          name: p.name,
        }));
        setParks(parkList);
      })
      .catch(() => setParks([]));
  }, [selectedRegion]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedPark(''); // Reset park selection when region changes
  };

  const handleParkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPark(e.target.value);
  };

  const handleFind = () => {
    if (selectedRegion && selectedPark) {
      window.location.href = `/park/${selectedRegion}/${selectedPark}`;
    }
  };

  const isDisabled = !selectedRegion || !selectedPark;

  return (
    <div className={`${styles.searchBox} ${compact ? styles.compact : ''}`}>
      <div className={styles.selectWrapper}>
        <div className={styles.selectGroup}>
          <label className={styles.label}>{t('search.selectRegion')}</label>
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className={styles.select}
          >
            <option value="">{t('search.whereToExplore')}</option>
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label className={styles.label}>{t('search.selectNationalPark')}</label>
          <select
            value={selectedPark}
            onChange={handleParkChange}
            className={styles.select}
            disabled={!selectedRegion}
          >
            <option value="">
              {selectedRegion ? t('search.whichDestination') : t('search.selectRegionFirst')}
            </option>
            {parks.map((park) => (
              <option key={park.slug} value={park.slug}>
                {park.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleFind}
        disabled={isDisabled}
        className={`${styles.findButton} ${isDisabled ? styles.disabled : ''}`}
      >
        {compact ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        ) : (
          t('search.search')
        )}
      </button>
    </div>
  );
};

export default SearchBox;
