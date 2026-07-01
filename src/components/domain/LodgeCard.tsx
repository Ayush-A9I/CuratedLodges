"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Star, ArrowRight, Wifi, Waves, UtensilsCrossed, Droplet, Car, Dumbbell, Wind, Flame, Book, Wine, ChevronLeft, ChevronRight, Leaf, Sun, CloudRain, Snowflake } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useTranslation } from 'react-i18next';
import { resolveImageUrl } from '@/lib/fallbackImages';
import styles from './LodgeCard.module.css';

// Neutral light-gray blur placeholder — prevents flash before image loads.
// Cards sit on a white/#FAFAFA background so this blends seamlessly.
const CARD_BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OdXPQAIoAM4G2QPBQAAAABJRU5ErkJggg==';

interface LodgeCardProps {
  image: string;
  images?: string[];
  title: string;
  location: string;
  rating: number;
  price: string | number;
  link?: string;
  amenities?: string[];
  ecoCertified?: boolean;
  bestSeason?: string;
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
  bestSeason,
  onClick,
}) => {
  const heroImage = resolveImageUrl(image, 'lodge');
  const galleryImages = (images && images.length > 0 ? images : [heroImage]).map((img) =>
    resolveImageUrl(img, 'lodgeGallery')
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { convertPrice, currency, exchangeRate } = useLocalization();
  const { t } = useTranslation();
  const [, forceUpdate] = useState({});
  const router = useRouter();

  // Force re-render when currency changes
  useEffect(() => {
    forceUpdate({});
  }, [currency, exchangeRate]);

  // Convert price to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[$₹,]/g, '')) : price;
  const displayPrice = convertPrice(numericPrice);

  const getSeasonIcon = (season?: string) => {
    if (!season) return null;
    const seasonLower = season.toLowerCase();
    if (seasonLower.includes('winter')) return <Snowflake size={12} />;
    if (seasonLower.includes('summer')) return <Sun size={12} />;
    if (seasonLower.includes('rainy') || seasonLower.includes('monsoon')) return <CloudRain size={12} />;
    return null;
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (link && link !== '#') {
      router.push(link, { scroll: true });
    }
  };

  return (
    <div className={styles.card} onClick={handleCardClick} style={{ cursor: (onClick || (link && link !== '#')) ? 'pointer' : 'default' }}>
      <div className={styles.imageContainer}>
        <Image
          src={galleryImages[currentImageIndex]}
          alt={title}
          fill
          sizes="(max-width: 768px) 85vw, 400px"
          className={styles.image}
          style={{ objectFit: 'cover' }}
          placeholder="blur"
          blurDataURL={CARD_BLUR_PLACEHOLDER}
        />
        {bestSeason && (
          <div className={styles.seasonBadge}>
            {getSeasonIcon(bestSeason)}
            <span>{t('lodge.bestIn', { season: bestSeason })}</span>
          </div>
        )}
        {galleryImages.length > 1 && (
          <>
            <button
              className={styles.navButtonLeft}
              onClick={goToPrevious}
              aria-label={t('accessibility.previousImage')}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={styles.navButtonRight}
              onClick={goToNext}
              aria-label={t('accessibility.nextImage')}
            >
              <ChevronRight size={24} />
            </button>
            <div className={styles.imageIndicators}>
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentImageIndex ? styles.indicatorActive : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`${t('accessibility.viewImage')} ${index + 1}`}
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
              <span>{t('lodge.ecoCertified')}</span>
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
          <span className={styles.fromText}>{t('lodge.from')}</span>
          <span className={styles.price}>{displayPrice}</span>
          <span className={styles.nightText}>{t('price.perNight')}</span>
        </div>
        <button className={styles.arrowButton} onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LodgeCard;
