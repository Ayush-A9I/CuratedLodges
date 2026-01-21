"use client";

import React from 'react';
import { Sun, Binoculars, Coffee, Flame, Compass, Moon, Utensils, Trees } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import styles from './experience.module.css';

export default function ExperiencePage() {
  return (
    <>
      <Header darkMode={false} />
      <div className={styles.pageContainer}>
        
        {/* Cinematic Hero */}
        <div className={styles.heroSection}>
          <img 
            src="https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&q=80&w=2000" 
            className={styles.heroImage}
            alt="Experience Hero" 
          />
          <div className={styles.heroOverlay}></div>
          
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>
              Beyond the Map
            </span>
            <h1 className={styles.heroTitle}>
              Experience the Wild.<br/>
              <span className={styles.heroTitleGradient}>Live the Untamed.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Curated wildlife experiences across India and Africa&apos;s finest wilderness reserves.
            </p>
          </div>
        </div>

        {/* The Day in the Life - Vertical Scroll Timeline */}
        <section className={styles.timelineSection}>
          <h2 className={styles.sectionBackground}>
            The Rhythm
          </h2>

          <div className={styles.timelineContainer}>
            {/* Vertical Line */}
            <div className={styles.timelineLine}></div>

            {/* Dawn Safaris */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTime}>
                  <Sun size={20} /> Dawn Safaris
                </div>
                <h3 className={styles.timelineHeading}>Golden Hour Pursuits</h3>
                <p className={styles.timelineText}>
                  Witness the wilderness awaken as you track predators and herbivores during their most active hours. From Bengal tigers in Indian reserves to African lions on the savannah.
                </p>
              </div>
              <div className={styles.timelineImageWrapper}>
                <div className={styles.timelineImageCard} style={{ transform: 'rotate(3deg)' }}>
                  <img src="https://images.unsplash.com/photo-1445308394109-4ec2920981b1?auto=format&fit=crop&q=80&w=800" className={styles.timelineImage} alt="The Awakening" />
                </div>
              </div>
            </div>

            {/* Wildlife Tracking */}
            <div className={`${styles.timelineItem} ${styles.timelineItemReverse}`}>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTime}>
                  <Binoculars size={20} /> Wildlife Tracking
                </div>
                <h3 className={styles.timelineHeading}>Expert-Led Expeditions</h3>
                <p className={styles.timelineText}>
                  Learn from experienced naturalists who read the forest like a book. Identify pugmarks, alarm calls, and behavioral patterns of leopards, elephants, rhinos, and more.
                </p>
              </div>
              <div className={styles.timelineImageWrapper}>
                <div className={styles.timelineImageCard} style={{ transform: 'rotate(-3deg)' }}>
                  <img src="https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&q=80&w=800" className={styles.timelineImage} alt="The Pursuit" />
                </div>
              </div>
            </div>

            {/* Bush Dining */}
            <div className={styles.timelineItem}>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTime}>
                  <Coffee size={20} /> Bush Dining
                </div>
                <h3 className={styles.timelineHeading}>Culinary Adventures</h3>
                <p className={styles.timelineText}>
                  Savor authentic local cuisines in stunning natural settings. From traditional Indian dishes to African-inspired menus, every meal celebrates regional heritage.
                </p>
              </div>
              <div className={styles.timelineImageWrapper}>
                <div className={styles.timelineImageCard} style={{ transform: 'rotate(3deg)' }}>
                  <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800" className={styles.timelineImage} alt="The Stillness" />
                </div>
              </div>
            </div>

            {/* Night Experiences */}
            <div className={`${styles.timelineItem} ${styles.timelineItemReverse}`}>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTime}>
                  <Flame size={20} /> Night Experiences
                </div>
                <h3 className={styles.timelineHeading}>After Dark Magic</h3>
                <p className={styles.timelineText}>
                  Campfire stories under star-studded skies, night safaris to spot nocturnal wildlife, and the symphony of the wilderness after sunset.
                </p>
              </div>
              <div className={styles.timelineImageWrapper}>
                <div className={styles.timelineImageCard} style={{ transform: 'rotate(-3deg)' }}>
                  <img src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800" className={styles.timelineImage} alt="The Gathering" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Senses Grid */}
        <section className={styles.momentsSection}>
          <div className={styles.momentsContainer}>
            <div className={styles.momentsHeader}>
              <h2 className={styles.momentsTitle}>
                Curated<br/>Moments
              </h2>
              <p className={styles.momentsSubtitle}>
                We don&apos;t just book rooms. We architect experiences that engage every sense.
              </p>
            </div>

            <div className={styles.momentsGrid}>
              {[
                { title: "Private Tracking", icon: <Compass size={32} />, img: "https://images.unsplash.com/photo-1551009175-8a68da93d5f9?auto=format&fit=crop&q=80&w=600" },
                { title: "Star Beds", icon: <Moon size={32} />, img: "https://images.unsplash.com/photo-1519055548599-6d4d129508c4?auto=format&fit=crop&q=80&w=600" },
                { title: "Bush Dining", icon: <Utensils size={32} />, img: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=600" },
              ].map((item, i) => (
                <div key={i} className={styles.momentCard}>
                  <img src={item.img} className={styles.momentImage} alt={item.title} />
                  <div className={styles.momentOverlay} />
                  <div className={styles.momentContent}>
                    <div className={styles.momentIcon}>
                      {item.icon}
                    </div>
                    <h3 className={styles.momentTitle}>
                      {item.title}
                    </h3>
                    <div className={styles.momentDiscover}>
                      <span>Discover</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to feel it?</h2>
              <p className={styles.ctaSubtitle}>
                Let us curate a bespoke itinerary that matches your rhythm of the wild.
              </p>
              <Link href="/basecamps" className={styles.ctaButton}>
                Explore Basecamps
              </Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
