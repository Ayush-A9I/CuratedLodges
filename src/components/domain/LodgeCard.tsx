import React from 'react';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import styles from './LodgeCard.module.css';

interface LodgeCardProps {
  image: string;
  title: string;
  location: string;
  rating: number;
  price: string;
  link?: string;
}

const LodgeCard: React.FC<LodgeCardProps> = ({
  image,
  title,
  location,
  rating,
  price,
  link = '#'
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={image} alt={title} className={styles.image} />
        <div className={styles.rating}>
          <Star size={16} fill="#F1663F" color="#F1663F" />
          <span>{rating}</span>
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.location}>
          <MapPin size={16} />
          <span>{location}</span>
        </div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.priceContainer}>
          <span className={styles.fromText}>From</span>
          <span className={styles.price}>{price}</span>
          <span className={styles.nightText}>/ night</span>
        </div>
        <button className={styles.arrowButton}>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LodgeCard;
