import React from 'react';
import { Shield, Compass, CheckCircle } from 'lucide-react';
import styles from './FeaturesSection.module.css';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'EXPERTLY VETTED',
      description: 'We inhabit every sanctuary in our collection. Each is personally audited for ethics and narrative depth.'
    },
    {
      icon: Compass,
      title: 'NARRATIVE DRIVEN',
      description: 'We curate stays that offer more than a room—they offer a deeper connection to the terrain\'s story.'
    },
    {
      icon: CheckCircle,
      title: 'SEAMLESS BOOKING',
      description: 'Complex logistics in wild places handled with precision. We guide your confidence from departure to return.'
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <feature.icon className={styles.icon} size={40} strokeWidth={1.5} />
            <h3 className={styles.title}>{feature.title}</h3>
            <p className={styles.description}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
