"use client";

import React, { useState, useEffect } from 'react';
import { lodgesData } from '../../data/mock/LodgeData';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  initialRegion?: string;
  initialPark?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ initialRegion = '', initialPark = '' }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedPark, setSelectedPark] = useState<string>(initialPark);

  // Update state when props change
  useEffect(() => {
    setSelectedRegion(initialRegion);
    setSelectedPark(initialPark);
  }, [initialRegion, initialPark]);

  const regions = [
    { value: 'india', label: 'India' },
    { value: 'africa', label: 'Africa' }
  ];

  const getNationalParks = () => {
    if (!selectedRegion) return [];
    const regionData = lodgesData[selectedRegion as keyof typeof lodgesData];
    return Object.keys(regionData).map(park => ({
      value: park,
      label: park
    }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedPark(''); // Reset park selection when region changes
  };

  const handleParkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPark(e.target.value);
  };

  const handleFind = () => {
    if (selectedRegion && selectedPark) {
      // Navigate to the park page with region and park as URL parameters
      window.location.href = `/park/${selectedRegion}/${encodeURIComponent(selectedPark)}`;
    }
  };

  const isDisabled = !selectedRegion || !selectedPark;

  return (
    <div className={styles.searchBox}>
      <div className={styles.selectWrapper}>
        <div className={styles.selectGroup}>
          <label className={styles.label}>SELECT REGION</label>
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className={styles.select}
          >
            <option value="">Where to explore?</option>
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label className={styles.label}>SELECT NATIONAL PARK</label>
          <select
            value={selectedPark}
            onChange={handleParkChange}
            className={styles.select}
            disabled={!selectedRegion}
          >
            <option value="">
              {selectedRegion ? 'Which destination?' : 'Select region first'}
            </option>
            {getNationalParks().map((park) => (
              <option key={park.value} value={park.value}>
                {park.label}
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
        Find Lodges
      </button>
    </div>
  );
};

export default SearchBox;
