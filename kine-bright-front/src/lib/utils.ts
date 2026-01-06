import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYouTubeThumbnail(url: string | undefined, quality: 'maxres' | 'hq' | 'mq' | 'sd' = 'maxres'): string | null {
  if (!url) return null;

  // Handles:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    const qualityMap = {
      maxres: 'maxresdefault.jpg',
      hq: 'hqdefault.jpg',
      mq: 'mqdefault.jpg',
      sd: 'sddefault.jpg'
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
  }

  return null;
}
