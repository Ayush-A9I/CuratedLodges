'use client';

import React, { useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import styles from '@/app/park/[region]/[park]/[lodge]/lodge.module.css';
import {
  DEFAULT_IMMERSE_TITLE,
  type ImmerseInTheWildConfig,
  resolveImmerseVideos,
  shouldShowImmerseSection,
} from '@/lib/lodgeImmerseSection';
import { buildYouTubeEmbedUrl, buildYouTubeThumbnailUrl } from '@/lib/youtube';

interface ImmerseInTheWildProps {
  config: ImmerseInTheWildConfig;
  revealClass: (id: string, direction?: string) => string;
}

export default function ImmerseInTheWild({ config, revealClass }: ImmerseInTheWildProps) {
  const videos = useMemo(() => resolveImmerseVideos(config), [config]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!shouldShowImmerseSection(config)) {
    return null;
  }

  const safeIndex = Math.min(activeIndex, videos.length - 1);
  const active = videos[safeIndex];
  const title = config.title?.trim() || DEFAULT_IMMERSE_TITLE;
  const subtitle = config.subtitle?.trim();

  return (
    <section
      id="immerse-in-the-wild"
      className={styles.immerseWildSection}
      aria-labelledby="immerse-wild-heading"
    >
      <div className={styles.immerseWildGlow} aria-hidden="true" />

      <div className={`${styles.immerseWildInner} max-w-[1400px] mx-auto px-6`}>
        <header
          className={`${styles.immerseWildHeader} ${revealClass('immerse-head')}`}
          data-reveal-id="immerse-head"
        >
          <p className={styles.immerseWildEyebrow}>From the lodge</p>
          <h2 id="immerse-wild-heading" className={styles.immerseWildTitle}>
            {title}
          </h2>
          {subtitle ? <p className={styles.immerseWildSubtitle}>{subtitle}</p> : null}
        </header>

        <div
          className={`${styles.immerseWildLayout} ${videos.length > 1 ? styles.immerseWildLayoutMulti : ''}`}
        >
          <div
            className={`${styles.immerseWildPlayerWrap} ${revealClass('immerse-player', styles.revealFromLeft)}`}
            data-reveal-id="immerse-player"
          >
            <div className={styles.immerseWildPlayerFrame}>
              <iframe
                key={active.videoId}
                src={buildYouTubeEmbedUrl(active.videoId)}
                title={active.title?.trim() || `${title} — video ${safeIndex + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className={styles.immerseWildIframe}
              />
            </div>
            {(active.title?.trim() || active.caption?.trim()) && (
              <div className={styles.immerseWildActiveMeta}>
                {active.title?.trim() ? (
                  <h3 className={styles.immerseWildActiveTitle}>{active.title.trim()}</h3>
                ) : null}
                {active.caption?.trim() ? (
                  <p className={styles.immerseWildActiveCaption}>{active.caption.trim()}</p>
                ) : null}
              </div>
            )}
          </div>

          {videos.length > 1 ? (
            <aside
              className={`${styles.immerseWildPlaylist} ${revealClass('immerse-playlist', styles.revealFromRight)}`}
              data-reveal-id="immerse-playlist"
              aria-label="More lodge videos"
            >
              {videos.map((video, index) => {
                const isActive = index === safeIndex;
                const label = video.title?.trim() || `Video ${index + 1}`;

                return (
                  <button
                    key={`${video.videoId}-${index}`}
                    type="button"
                    className={`${styles.immerseWildPlaylistItem} ${isActive ? styles.immerseWildPlaylistItemActive : ''}`}
                    onClick={() => setActiveIndex(index)}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className={styles.immerseWildThumbWrap}>
                      <img
                        src={buildYouTubeThumbnailUrl(video.videoId)}
                        alt=""
                        className={styles.immerseWildThumb}
                        loading="lazy"
                      />
                      {!isActive ? (
                        <span className={styles.immerseWildPlayBadge} aria-hidden="true">
                          <Play size={16} fill="currentColor" />
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.immerseWildPlaylistCopy}>
                      <span className={styles.immerseWildPlaylistIndex}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.immerseWildPlaylistTitle}>{label}</span>
                      {video.caption?.trim() ? (
                        <span className={styles.immerseWildPlaylistCaption}>{video.caption.trim()}</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
