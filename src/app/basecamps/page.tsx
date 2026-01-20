"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { lodgesData } from '../../data/mock/LodgeData';
import styles from './basecamps.module.css';

export default function BasecampsPage() {
  // Collect all lodges from all regions and parks
  const allLodges = Object.entries(lodgesData).flatMap(([region, parks]) =>
    Object.entries(parks).flatMap(([parkName, parkData]) =>
      parkData.lodges.map(lodge => ({
        ...lodge,
        parkName,
        region,
      }))
    )
  );


  // Helper function to create URL-friendly slugs
  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <>
      <Header forceVisible={true} darkMode={true} />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <p className={styles.heroLabel}>CURATED WILDERNESS STAYS</p>
            <h1 className={styles.heroTitle}>BASECAMPS</h1>
            <p className={styles.heroDescription}>
              Handpicked lodges and camps in the heart of India's most pristine wildlife reserves. 
              Each property selected for its commitment to conservation, exceptional naturalist guides, 
              and authentic safari experiences.
            </p>
          </div>
        </section>

        {/* Lodges Grid Section */}
        <section className={styles.lodgesSection}>
          <div className={styles.lodgesContainer}>
            <div className={styles.lodgesGrid}>
              {allLodges.map((lodge) => {
                // Get the minimum price from room types or fall back to pricePerNight
                const minPrice = lodge.roomTypes && lodge.roomTypes.length > 0
                  ? Math.min(...lodge.roomTypes.map(room => room.price))
                  : lodge.pricePerNight;

                const lodgeUrl = `/park/${lodge.region}/${createSlug(lodge.parkName)}/${createSlug(lodge.name)}`;

                return (
                  <Link 
                    href={lodgeUrl} 
                    key={lodge.id} 
                    className={styles.lodgeCard}
                  >
                    <div className={styles.lodgeImageWrapper}>
                      <img 
                        src={lodge.image} 
                        alt={lodge.name}
                        className={styles.lodgeImage}
                      />
                      <div className={styles.parkBadge}>
                        {lodge.parkName.toUpperCase()}
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
                          {lodge.about?.description[0]?.substring(0, 150) || 
                           `Experience luxury and wildlife at ${lodge.name}. Located in the heart of ${lodge.parkName}, offering an unforgettable safari experience.`}
                          ...
                        </p>
                        <div className={styles.priceSection}>
                          <div className={styles.priceSectionLeft}>
                            <span className={styles.startingFrom}>STARTING FROM</span>
                            <span className={styles.price}>₹{minPrice.toLocaleString('en-IN')}</span>
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
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
