"use client";

import React, { useState } from 'react';
import { MapPin, Star, ArrowRight, Wifi, Waves, UtensilsCrossed, Droplet, Car, Dumbbell, Wind, Flame, Book, Wine, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import styles from './LodgeCard.module.css';

interface LodgeCardProps {
  image: string;
  images?: string[];
  title: string;
  location: string;
  rating: number;
  price: string;
  link?: string;
  amenities?: string[];
  ecoCertified?: boolean;
  onClick?: () => void;
}

const amenityIcons: { [key: string]: { icon: React.ReactNode; label: string } } = {
  'WiFi': { icon: <Wifi size={14} />, label: 'WiFi' },
  'Pool': { icon: <Waves size={14} />, label: 'Pool' },
  'Spa': { icon: <Droplet size={14} />, label: 'Spa' },
  'Safari': { icon: <Car size={14} />, label: 'Gate Pick-up' },
  'Gym': { icon: <Dumbbell size={14} />, label: 'Gym' },
  'AC': { icon: <Wind size={14} />, label: 'AC' },
  'Bonfire': { icon: <Flame size={14} />, label: 'Bonfire' },
  'Library': { icon: <Book size={14} />, label: 'Library' },
  'Bar': { icon: <Wine size={14} />, label: 'Bar' },
};

const LodgeCard: React.FC<LodgeCardProps> = ({
  image,
  images = [image],
  title,
  location,
  rating,
  price,
  link = '#',
  amenities = [],
  ecoCertified = false,
  onClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className={styles.card} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.imageContainer}>
        <img 
          src={images[currentImageIndex]} 
          alt={title} 
          className={styles.image} 
        />
        {images.length > 1 && (
          <>
            <button 
              className={styles.navButtonLeft}
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className={styles.navButtonRight}
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
            <div className={styles.imageIndicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentImageIndex ? styles.indicatorActive : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          {ecoCertified && (
            <div className={styles.ecoBadge}>
              <Leaf size={12} />
              <span>Eco-Certified</span>
            </div>
          )}
        </div>
        <div className={styles.location}>
          <MapPin size={16} />
          <span>{location}</span>
        </div>
        
        {amenities.length > 0 && (
          <div className={styles.amenities}>
            {amenities.slice(0, 4).map((amenity, index) => (
              <div key={index} className={styles.amenityItem} title={amenity}>
                {amenityIcons[amenity] ? (
                  <>
                    {amenityIcons[amenity].icon}
                    <span className={styles.amenityText}>{amenityIcons[amenity].label}</span>
                  </>
                ) : (
                  <span>{amenity}</span>
                )}
              </div>
            ))}
            {amenities.length > 4 && (
              <div className={styles.amenityMore}>+{amenities.length - 4}</div>
            )}
          </div>
        )}
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
