"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ParkPageHeader from '../../../../components/layout/ParkPageHeader';
import Footer from '../../../../components/layout/Footer';
import LodgeCard from '../../../../components/domain/LodgeCard';
import api from '@/lib/api';
import styles from './park.module.css';

export default function ParkPage() {
  const params = useParams();
  const region = params.region as string;
  const park = decodeURIComponent(params.park as string);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [lodges, setLodges] = useState<any[]>([]);
  const [parkName, setParkName] = useState<string>(park);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!park) return;
    api.getLodgesByPark(park)
      .then((data) => {
        setLodges(data.lodges || []);
        if (data.parkName) setParkName(data.parkName);
      })
      .catch((err) => console.error('Failed to load park lodges:', err))
      .finally(() => setIsLoading(false));
  }, [park]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      <ParkPageHeader region={region} park={parkName} />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <nav className={styles.breadcrumb}>
              <Link href="/" className={styles.breadcrumbLink}>
                Home
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>Curated stays at {parkName.toLowerCase()}</span>
            </nav>
          </div>
        </section>

        {/* Lodges Grid Section */}
        <section className={styles.lodgesSection}>
          <div className={styles.lodgesContainer}>
            <div className={styles.filterWrapper}>
              <div className={styles.filterDropdown}>
                <select className={styles.gateFilter}>
                  <option value="">Filter by : All Gates</option>
                  <option value="mukki">Mukki Gate</option>
                  <option value="khobra">Khobra Gate</option>
                  <option value="moharli">Moharli Gate</option>
                  <option value="kolara">Kolara Gate</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                <div style={{ width: '2rem', height: '2rem', border: '2px solid #1E2D27', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : lodges.length > 0 ? (
              <div className={styles.lodgeGrid}>
                {lodges.map((lodge: any) => {
                  const minPrice = lodge.minRoomPrice || lodge.pricePerNight || 0;
                  const lodgeUrl = `/park/${region}/${park}/${lodge.slug}`;

                  return (
                    <div key={lodge.id} className={styles.lodgeCardWrapper}>
                      <LodgeCard
                        image={lodge.thumbnail}
                        images={lodge.images || [lodge.thumbnail]}
                        title={lodge.name}
                        location={lodge.location}
                        rating={lodge.rating}
                        price={minPrice.toString()}
                        link={lodgeUrl}
                        amenities={lodge.amenities}
                        ecoCertified={lodge.ecoCertified}
                        onClick={() => window.open(lodgeUrl, '_blank')}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noResults}>
                <p>No lodges found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Planning Section */}
        <section className={styles.planningSection}>
          <div className={styles.planningContainer}>
            <h2 className={styles.planningTitle}>Planning to stay at {parkName}?</h2>
            <p className={styles.planningSubtitle}>
              Read our field intelligence before you land. Expert tracking tips, gear recommendations, and the secret history of {parkName}.
            </p>
            
            <div className={styles.planningGrid}>
              <div className={styles.planningCard}>
                <div className={styles.planningImageWrapper}>
                  <img 
                    src="https://images.unsplash.com/photo-1549366021-9f761d450615?w=800" 
                    alt="Wildlife tracking" 
                    className={styles.planningImage}
                  />
                </div>
                <div className={styles.planningContent}>
                  <span className={styles.planningBadge}>Field Intel</span>
                  <h3 className={styles.planningCardTitle}>Mastering the morning track in {parkName}</h3>
                  <p className={styles.planningCardText}>
                    Why the Mukki grasslands hold the key to the tiger&apos;s morning patrol...
                  </p>
                  <a href="#" className={styles.planningLink}>
                    Know More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className={styles.planningCard}>
                <div className={styles.planningImageWrapper}>
                  <img 
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" 
                    alt="Safari experience" 
                    className={styles.planningImage}
                  />
                </div>
                <div className={styles.planningContent}>
                  <span className={styles.planningBadge}>Field Intel</span>
                  <h3 className={styles.planningCardTitle}>Safari prep: what guides won&apos;t tell you</h3>
                  <p className={styles.planningCardText}>
                    Essential gear, timing strategies, and etiquette for maximizing your wildlife encounters...
                  </p>
                  <a href="#" className={styles.planningLink}>
                    Know More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className={styles.planningCard}>
                <div className={styles.planningImageWrapper}>
                  <img 
                    src="https://images.unsplash.com/photo-1615963244664-5b845b2025ee?w=800" 
                    alt="Tiger in the wild" 
                    className={styles.planningImage}
                  />
                </div>
                <div className={styles.planningContent}>
                  <span className={styles.planningBadge}>Field Intel</span>
                  <h3 className={styles.planningCardTitle}>Understanding tiger territories</h3>
                  <p className={styles.planningCardText}>
                    A naturalist&apos;s guide to reading signs, tracking patterns, and predicting movement...
                  </p>
                  <a href="#" className={styles.planningLink}>
                    Know More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Explore Jungles CTA */}
            <div className={styles.exploreJunglesCTA}>
              <div className={styles.exploreJunglesContent}>
                <div className={styles.exploreJunglesLeft}>
                  <div className={styles.exploreJunglesImageWrapper}>
                    <img 
                      src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80" 
                      alt="Wildlife Research" 
                      className={styles.exploreJunglesImage}
                    />
                  </div>
                </div>
                <div className={styles.exploreJunglesRight}>
                  <div className={styles.exploreJunglesTextWrapper}>
                    <span className={styles.exploreJunglesLabel}>Wildlife Knowledge Hub</span>
                    <h3 className={styles.exploreJunglesTitle}>Dive Deeper Into Wildlife Exploration</h3>
                    <p className={styles.exploreJunglesDescription}>
                      Access expert insights, conservation research, and comprehensive guides on wildlife behavior and natural habitats
                    </p>
                    <a 
                      href="https://explorejungles.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.exploreJunglesButton}
                    >
                      <span>Explore Jungles</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <h2 className={styles.faqTitle}>FAQs</h2>
            <p className={styles.faqSubtitle}>
              Everything you need to know about lodges in {parkName}
            </p>
            
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqQuestion} onClick={() => toggleFaq(0)}>
                  <h3>What amenities do the lodges typically offer?</h3>
                  <span className={`${styles.faqIcon} ${openFaqIndex === 0 ? styles.open : ''}`}>+</span>
                </div>
                {openFaqIndex === 0 && (
                  <div className={styles.faqAnswer}>
                    <p>Most lodges in {parkName} offer modern amenities including WiFi, air conditioning, swimming pools, spa services, and in-house dining. Many also provide safari vehicles with naturalist guides and gate pick-up services.</p>
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqQuestion} onClick={() => toggleFaq(1)}>
                  <h3>Do lodges include meals in their packages?</h3>
                  <span className={`${styles.faqIcon} ${openFaqIndex === 1 ? styles.open : ''}`}>+</span>
                </div>
                {openFaqIndex === 1 && (
                  <div className={styles.faqAnswer}>
                    <p>Yes, most lodges offer full board packages that include breakfast, lunch, and dinner. Many feature multi-cuisine restaurants with local and international dishes, and some offer special bush dinners or bonfire dining experiences.</p>
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqQuestion} onClick={() => toggleFaq(2)}>
                  <h3>Are safari activities included in the lodge booking?</h3>
                  <span className={`${styles.faqIcon} ${openFaqIndex === 2 ? styles.open : ''}`}>+</span>
                </div>
                {openFaqIndex === 2 && (
                  <div className={styles.faqAnswer}>
                    <p>Safari drives are typically included in the lodge packages, along with the services of experienced naturalists and guides. Some lodges also offer nature walks, bird watching tours, and cultural village visits as part of their activities.</p>
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqQuestion} onClick={() => toggleFaq(3)}>
                  <h3>What types of accommodations are available at the lodges?</h3>
                  <span className={`${styles.faqIcon} ${openFaqIndex === 3 ? styles.open : ''}`}>+</span>
                </div>
                {openFaqIndex === 3 && (
                  <div className={styles.faqAnswer}>
                    <p>Lodges offer a range of accommodations from luxury suites and private villas to comfortable cottages and tented camps. All rooms feature en-suite bathrooms, comfortable beds, and views of the surrounding wilderness or gardens.</p>
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqQuestion} onClick={() => toggleFaq(4)}>
                  <h3>How far in advance should I book a lodge?</h3>
                  <span className={`${styles.faqIcon} ${openFaqIndex === 4 ? styles.open : ''}`}>+</span>
                </div>
                {openFaqIndex === 4 && (
                  <div className={styles.faqAnswer}>
                    <p>We recommend booking your lodge at least 2-3 months in advance, especially during peak wildlife viewing season. Popular eco-certified lodges and boutique properties can fill up quickly, so early booking ensures better availability and rates.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
