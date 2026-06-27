'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { resolveImageUrl } from '@/lib/fallbackImages';
import { parseYouTubeVideoId, buildYouTubeBackgroundEmbedUrl } from '@/lib/youtube';
import styles from './HomeHero.module.css';

export interface HomeHeroProps {
  imageUrl: string | null | undefined;
  videoUrl?: string | null;
}

export default function HomeHero({ imageUrl, videoUrl }: HomeHeroProps) {
  const imageSrc = resolveImageUrl(imageUrl, 'park');
  const trimmedVideo = videoUrl?.trim() || '';
  const youtubeVideoId = trimmedVideo ? parseYouTubeVideoId(trimmedVideo) : null;
  const directVideoUrl = trimmedVideo && !youtubeVideoId ? trimmedVideo : null;
  const showVideo = Boolean(youtubeVideoId || directVideoUrl);

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        className={styles.heroImage}
        fetchPriority="high"
        decoding="async"
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
          aria-label="Tap anywhere to enable sound"
        >
          <span className={styles.heroSoundGateChip}>
            <Volume2 size={18} /> Tap anywhere for sound
          </span>
        </button>
      ) : null}

      <div className={styles.heroOverlay} />
    </section>
  );
}
