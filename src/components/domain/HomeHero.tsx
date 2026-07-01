'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveImageUrl } from '@/lib/fallbackImages';
import { parseYouTubeVideoId, buildYouTubeBackgroundEmbedUrl } from '@/lib/youtube';
import styles from './HomeHero.module.css';

// Brand dark-green (#1e2d27) as a 1×1 blur placeholder.
// Matches the hero's background colour so there is no flash before the image loads.
const HERO_BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkyP9fDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export interface HomeHeroProps {
  imageUrl: string | null | undefined;
  videoUrl?: string | null;
}

export default function HomeHero({ imageUrl, videoUrl }: HomeHeroProps) {
  const { t } = useTranslation();
  const imageSrc = resolveImageUrl(imageUrl, 'park');
  const trimmedVideo = videoUrl?.trim() || '';
  const youtubeVideoId = trimmedVideo ? parseYouTubeVideoId(trimmedVideo) : null;
  const directVideoUrl = trimmedVideo && !youtubeVideoId ? trimmedVideo : null;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);

  const startDirectVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      video.volume = 1;
      await video.play();
      setIsHeroMuted(false);
      setShowSoundPrompt(false);
    } catch {
      video.muted = true;
      setIsHeroMuted(true);
      setShowSoundPrompt(true);
      try {
        await video.play();
      } catch (err) {
        console.error('Unable to start homepage hero video:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!directVideoUrl) return;
    startDirectVideo();
  }, [directVideoUrl, startDirectVideo]);

  const enableHeroAudio = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    setIsHeroMuted(false);
    setShowSoundPrompt(false);

    try {
      await video.play();
    } catch (err) {
      console.error('Unable to enable homepage hero audio:', err);
    }
  }, []);

  useEffect(() => {
    if (!directVideoUrl) return;

    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener('pointerdown', enableHeroAudio, opts);
    window.addEventListener('touchstart', enableHeroAudio, opts);
    window.addEventListener('wheel', enableHeroAudio, opts);
    window.addEventListener('keydown', enableHeroAudio, opts);

    return () => {
      window.removeEventListener('pointerdown', enableHeroAudio);
      window.removeEventListener('touchstart', enableHeroAudio);
      window.removeEventListener('wheel', enableHeroAudio);
      window.removeEventListener('keydown', enableHeroAudio);
    };
  }, [directVideoUrl, enableHeroAudio]);

  return (
    <section className={styles.hero}>
      <Image
        src={imageSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.heroImage}
        style={{ objectFit: 'cover' }}
        placeholder="blur"
        blurDataURL={HERO_BLUR_PLACEHOLDER}
      />

      {youtubeVideoId ? (
        <div className={styles.heroYoutubeWrap} aria-hidden="true">
          <iframe
            src={buildYouTubeBackgroundEmbedUrl(youtubeVideoId)}
            title="Homepage hero video"
            className={styles.heroYoutube}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      {directVideoUrl ? (
        <video
          ref={videoRef}
          className={styles.heroVideo}
          autoPlay
          muted={isHeroMuted}
          loop
          playsInline
          preload="metadata"
        >
          <source src={directVideoUrl} />
        </video>
      ) : null}

      {showSoundPrompt && directVideoUrl ? (
        <button
          type="button"
          className={styles.heroSoundGate}
          onClick={enableHeroAudio}
          aria-label={t('hero.soundPromptAria')}
        >
          <span className={styles.heroSoundGateChip}>
            <Volume2 size={18} /> {t('hero.soundPromptChip')}
          </span>
        </button>
      ) : null}

      <div className={styles.heroOverlay} />
    </section>
  );
}
