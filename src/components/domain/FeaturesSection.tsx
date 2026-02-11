"use client";

import React from 'react';
import { Shield, Compass, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './FeaturesSection.module.css';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Shield,
      titleKey: 'sections.expertlyVetted',
      descKey: 'sections.expertlyVettedDesc'
    },
    {
      icon: Compass,
      titleKey: 'sections.narrativeDriven',
      descKey: 'sections.narrativeDrivenDesc'
    },
    {
      icon: CheckCircle,
      titleKey: 'sections.seamlessBooking',
      descKey: 'sections.seamlessBookingDesc'
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <feature.icon className={styles.icon} size={40} strokeWidth={1.5} />
            <h3 className={styles.title}>{t(feature.titleKey)}</h3>
            <p className={styles.description}>{t(feature.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
