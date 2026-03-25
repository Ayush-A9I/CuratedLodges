"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLocalization } from '@/contexts/LocalizationContext';
import api from '@/lib/api';
import styles from './basecamps.module.css';

export default function BasecampsPage() {
  const { t } = useTranslation();
  const { convertPrice, currency, exchangeRate } = useLocalization();
  const [lodges, setLodges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    api.getAllLodges()
      .then((data) => setLodges(data.lodges || []))
      .catch((err) => console.error('Failed to load lodges:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Force re-render when currency changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [currency, exchangeRate]);

  return (
    <>
      <Header forceVisible={true} forceScrolled={true} />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <p className={styles.heroLabel}>{t('sections.curatedStays')}</p>
            <h1 className={styles.heroTitle}>{t('sections.basecamps')}</h1>
            <p className={styles.heroDescription}>
              {t('sections.basecampsDesc')}
            </p>
          </div>
        </section>

        {/* Lodges Grid Section */}
        <section className={styles.lodgesSection}>
          <div className={styles.lodgesContainer}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                <div style={{ width: '2rem', height: '2rem', border: '2px solid #1E2D27', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div className={styles.lodgesGrid}>
                {lodges.map((lodge: any) => {
                  const lodgeUrl = `/park/${lodge.regionSlug}/${lodge.parkSlug}/${lodge.slug}`;
                  const minPrice = lodge.minRoomPrice || lodge.pricePerNight || 0;

                  return (
                    <Link 
                      href={lodgeUrl} 
                      key={lodge.id} 
                      className={styles.lodgeCard}
                    >
                      <div className={styles.lodgeImageWrapper}>
                        <img 
                          src={lodge.thumbnail} 
                          alt={lodge.name}
                          className={styles.lodgeImage}
                        />
                        <div className={styles.parkBadge}>
                          {(lodge.parkName || '').toUpperCase()}
                        </div>
                      </div>
                      
                      <div className={styles.lodgeInfo}>
                        <h3 className={styles.lodgeName}>{lodge.name}</h3>
                        <p className={styles.lodgeLocation}>
                          <MapPin size={12} />
                          {lodge.location}
                        </p>
                      </div>

                      {/* Hover Content */}
                      <div className={styles.hoverContent}>
                        <div className={styles.hoverBottom}>
                          <h3 className={styles.hoverTitle}>{lodge.name}</h3>
                          <p className={styles.hoverDescription}>
                            {lodge.about?.substring(0, 150) || 
                             `Experience luxury and wildlife at ${lodge.name}. Located in the heart of ${lodge.parkName || 'the park'}, offering an unforgettable safari experience.`}
                            ...
                          </p>
                          <div className={styles.priceSection}>
                            <div className={styles.priceSectionLeft}>
                              <span className={styles.startingFrom}>STARTING FROM</span>
                              <span className={styles.price}>{convertPrice(minPrice)}</span>
                            </div>
                            <div className={styles.viewLodgeButton}>
                              VIEW LODGE
                              <ArrowRight size={12} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
