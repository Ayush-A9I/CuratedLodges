import { isValidYouTubeUrl, parseYouTubeVideoId } from '@/lib/youtube';

export interface LodgeHeroConfig {
  /** When true (default), show the lodge thumbnail as the hero image. */
  showImage: boolean;
  /** When true and a video URL is set, show a background hero video. */
  showVideo: boolean;
  /** Direct mp4/webm URL or YouTube link. */
  videoUrl: string;
}

export interface ResolvedLodgeHero {
  showImage: boolean;
  showVideo: boolean;
  imageSrc: string;
  youtubeVideoId: string | null;
  directVideoUrl: string | null;
}

export function defaultLodgeHeroConfig(): LodgeHeroConfig {
  return {
    showImage: true,
    showVideo: false,
    videoUrl: '',
  };
}

export function readLodgeHero(raw: unknown): LodgeHeroConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultLodgeHeroConfig();
  }

  const src = raw as Record<string, unknown>;
  return {
    showImage: src.showImage !== false,
    showVideo: src.showVideo === true,
    videoUrl: typeof src.videoUrl === 'string' ? src.videoUrl : '',
  };
}

export function readLodgeHeroFromContent(content: unknown): LodgeHeroConfig {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return defaultLodgeHeroConfig();
  }
  return readLodgeHero((content as Record<string, unknown>).lodgeHero);
}

export function resolveLodgeHero(
  config: LodgeHeroConfig,
  thumbnail: string,
  resolveThumbnail: (url: string) => string
): ResolvedLodgeHero {
  const imageSrc = resolveThumbnail(thumbnail);
  const videoUrl = config.videoUrl.trim();
  const youtubeVideoId = videoUrl ? parseYouTubeVideoId(videoUrl) : null;
  const directVideoUrl = videoUrl && !youtubeVideoId ? videoUrl : null;
  const hasVideoSource = Boolean(youtubeVideoId || directVideoUrl);
  const showVideo = config.showVideo === true && hasVideoSource;
  const showImage = config.showImage !== false || !showVideo;

  return {
    showImage,
    showVideo,
    imageSrc,
    youtubeVideoId,
    directVideoUrl,
  };
}

export function serializeLodgeHero(config: LodgeHeroConfig): Record<string, unknown> | undefined {
  const videoUrl = config.videoUrl.trim();
  const showImage = config.showImage !== false;
  const showVideo = config.showVideo === true;

  const isDefault = showImage && !showVideo && !videoUrl;
  if (isDefault) return undefined;

  const out: Record<string, unknown> = {};
  if (!showImage) out.showImage = false;
  if (showVideo) out.showVideo = true;
  if (videoUrl) out.videoUrl = videoUrl;

  return Object.keys(out).length > 0 ? out : undefined;
}

export function validateLodgeHeroDraft(config: LodgeHeroConfig): string | null {
  if (!config.showVideo) return null;

  const videoUrl = config.videoUrl.trim();
  if (!videoUrl) {
    return 'Add a video URL when hero video is enabled.';
  }

  const isYouTube = isValidYouTubeUrl(videoUrl);
  if (!isYouTube && !/^https?:\/\/.+/i.test(videoUrl)) {
    return 'Use a YouTube link or a direct https video URL.';
  }

  return null;
}
