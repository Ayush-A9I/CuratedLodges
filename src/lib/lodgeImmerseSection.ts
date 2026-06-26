import { isValidYouTubeUrl, parseYouTubeVideoId } from '@/lib/youtube';

export const DEFAULT_IMMERSE_TITLE = 'Immerse in the Wild';

export interface ImmerseVideoEntry {
  youtubeUrl: string;
  title?: string;
  caption?: string;
}

export interface ImmerseInTheWildConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  videos: ImmerseVideoEntry[];
}

export interface ResolvedImmerseVideo extends ImmerseVideoEntry {
  videoId: string;
}

export function defaultImmerseConfig(): ImmerseInTheWildConfig {
  return {
    enabled: false,
    title: DEFAULT_IMMERSE_TITLE,
    subtitle: '',
    videos: [{ youtubeUrl: '', title: '', caption: '' }],
  };
}

export function readImmerseSection(raw: unknown): ImmerseInTheWildConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultImmerseConfig();
  }

  const src = raw as Record<string, unknown>;
  const videos = Array.isArray(src.videos)
    ? src.videos.map((v) => {
        const entry = v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
        return {
          youtubeUrl: typeof entry.youtubeUrl === 'string' ? entry.youtubeUrl : '',
          title: typeof entry.title === 'string' ? entry.title : '',
          caption: typeof entry.caption === 'string' ? entry.caption : '',
        };
      })
    : [];

  return {
    enabled: src.enabled === true,
    title: typeof src.title === 'string' ? src.title : DEFAULT_IMMERSE_TITLE,
    subtitle: typeof src.subtitle === 'string' ? src.subtitle : '',
    videos: videos.length > 0 ? videos : [{ youtubeUrl: '', title: '', caption: '' }],
  };
}

export function resolveImmerseVideos(config: ImmerseInTheWildConfig): ResolvedImmerseVideo[] {
  return config.videos
    .map((video) => {
      const videoId = parseYouTubeVideoId(video.youtubeUrl);
      if (!videoId) return null;
      return { ...video, videoId };
    })
    .filter((v): v is ResolvedImmerseVideo => v !== null);
}

export function shouldShowImmerseSection(config: ImmerseInTheWildConfig): boolean {
  return config.enabled && resolveImmerseVideos(config).length > 0;
}

export function serializeImmerseSection(config: ImmerseInTheWildConfig): Record<string, unknown> | undefined {
  const videos = config.videos
    .map((v) => ({
      youtubeUrl: v.youtubeUrl.trim(),
      ...(v.title?.trim() ? { title: v.title.trim() } : {}),
      ...(v.caption?.trim() ? { caption: v.caption.trim() } : {}),
    }))
    .filter((v) => v.youtubeUrl !== '');

  const title = config.title?.trim() || DEFAULT_IMMERSE_TITLE;
  const subtitle = config.subtitle?.trim() || '';

  if (!config.enabled && videos.length === 0) {
    return undefined;
  }

  const out: Record<string, unknown> = {
    enabled: config.enabled,
    ...(title !== DEFAULT_IMMERSE_TITLE ? { title } : {}),
    ...(subtitle ? { subtitle } : {}),
  };

  if (videos.length > 0) {
    out.videos = videos;
  }

  return out;
}

export function validateImmerseDraft(config: ImmerseInTheWildConfig): string | null {
  if (!config.enabled) return null;

  const nonEmpty = config.videos.filter((v) => v.youtubeUrl.trim() !== '');
  if (nonEmpty.length === 0) {
    return 'Add at least one YouTube link when the section is enabled.';
  }

  const invalid = nonEmpty.find((v) => !isValidYouTubeUrl(v.youtubeUrl));
  if (invalid) {
    return 'One or more YouTube links are invalid. Use a full youtube.com or youtu.be URL.';
  }

  return null;
}
