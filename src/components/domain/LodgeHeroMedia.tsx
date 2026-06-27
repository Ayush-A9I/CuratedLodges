'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import styles from '@/app/park/[region]/[park]/[lodge]/lodge.module.css';
import type { ResolvedLodgeHero } from '@/lib/lodgeHeroSection';
import { buildYouTubeBackgroundEmbedUrl } from '@/lib/youtube';

interface LodgeHeroMediaProps {
  hero: ResolvedLodgeHero;
  alt: string;
}

export default function LodgeHeroMedia({ hero, alt }: LodgeHeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEmbedReady(true));
    return () => cancelAnimationFrame(frame);
  }, [hero.youtubeVideoId, hero.directVideoUrl]);

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
        console.error('Unable to start hero video playback:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!hero.showVideo || hero.youtubeVideoId || !hero.directVideoUrl) return;
    startDirectVideo();
  }, [hero.showVideo, hero.youtubeVideoId, hero.directVideoUrl, startDirectVideo]);

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
      console.error('Unable to start hero video with audio after interaction:', err);
    }
  }, []);

  useEffect(() => {
    if (!hero.showVideo || !hero.directVideoUrl) return;

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
  }, [hero.showVideo, hero.directVideoUrl, enableHeroAudio]);

  return (
    <>
      {hero.showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.imageSrc}
          alt={alt}
          className={styles.heroImage}
          fetchPriority="high"
          decoding="async"
        />
      ) : null}

      {hero.showVideo && hero.youtubeVideoId && embedReady ? (
        <div className={styles.heroYoutubeWrap} aria-hidden="true">
          <iframe
            src={buildYouTubeBackgroundEmbedUrl(hero.youtubeVideoId)}
            title={`${alt} hero video`}
            className={styles.heroYoutube}
            tabIndex={-1}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      {hero.showVideo && hero.directVideoUrl && embedReady ? (
        <video
          ref={videoRef}
          className={styles.heroVideo}
          autoPlay
          muted={isHeroMuted}
          loop
          playsInline
          preload="metadata"
          poster={hero.showImage ? undefined : hero.imageSrc}
        >
          <source src={hero.directVideoUrl} />
        </video>
      ) : null}

      {showSoundPrompt && hero.directVideoUrl ? (
        <button
          type="button"
          className={styles.heroSoundGate}
          onClick={enableHeroAudio}
          aria-label="Tap anywhere to enable sound"
        >
          <span className={styles.heroSoundGateChip}>
            <Volume2 size={18} /> Tap anywhere for sound
          </span>
        </button>
      ) : null}
    </>
  );
}
