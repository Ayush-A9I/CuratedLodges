"use client";

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ParkPageHeader from '../../../../components/layout/ParkPageHeader';
import Footer from '../../../../components/layout/Footer';
import LodgeCard from '../../../../components/domain/LodgeCard';
import { lodgesData } from '../../../../data/mock/LodgeData';
import styles from './park.module.css';

export default function ParkPage() {
  const params = useParams();
  const region = params.region as string;
  const park = decodeURIComponent(params.park as string);
  
  const [selectedGate, setSelectedGate] = useState<string>('all');

  // Get park data
  const parkData = useMemo(() => {
    if (!region || !park) return null;
    const regionData = lodgesData[region as keyof typeof lodgesData];
    if (!regionData) return null;
    return regionData[park];
  }, [region, park]);

  // Get unique gates
  const gates = useMemo(() => {
    if (!parkData) return [];
    const gateSet = new Set<string>();
    parkData.lodges.forEach(lodge => {
      lodge.nearestGates.forEach(gate => gateSet.add(gate));
    });
    return Array.from(gateSet).sort();
  }, [parkData]);

  // Filter lodges by gate
  const filteredLodges = useMemo(() => {
    if (!parkData) return [];
    if (selectedGate === 'all') return parkData.lodges;
    return parkData.lodges.filter(lodge => 
      lodge.nearestGates.includes(selectedGate)
    );
  }, [parkData, selectedGate]);

  if (!parkData) {
    return (
      <>
        <ParkPageHeader region={region} park={park} />
        <div className={styles.errorContainer}>
          <h1>Park Not Found</h1>
          <Link href="/" className={styles.backLink}>Return Home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <ParkPageHeader region={region} park={park} />
      
      <main className={styles.main}>
        {/* Lodges Grid Section */}
        <section className={styles.lodgesSection}>
          <div className={styles.lodgesContainer}>
            {filteredLodges.length > 0 ? (
              <div className={styles.lodgeGrid}>
                {filteredLodges.map((lodge) => (
                  <div key={lodge.id} className={styles.lodgeCardWrapper}>
                    <LodgeCard
                      image={lodge.image}
                      title={lodge.name}
                      location={`${park}, ${region}`}
                      rating={lodge.rating}
                      price={lodge.pricePerNight}
                      link={lodge.link}
                    />
                    <div className={styles.lodgeGates}>
                      <svg className={styles.gateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={styles.gatesText}>
                        Near: {lodge.nearestGates.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <p>No lodges found for the selected gate.</p>
                <button 
                  onClick={() => setSelectedGate('all')}
                  className={styles.clearAllButton}
                >
                  Show All Lodges
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
