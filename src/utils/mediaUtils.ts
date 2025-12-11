/**
 * Detect if a URL is a video based on file extension or streaming format
 * @param url - Media URL to check
 * @returns true if URL is a video, false otherwise
 */
export const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8', '.mpd', '.ts'];
  const lowerUrl = url.toLowerCase();
  
  // Check for HLS (.m3u8) or DASH (.mpd) streaming formats
  if (lowerUrl.includes('.m3u8') || lowerUrl.includes('.mpd') || lowerUrl.includes('m3u8')) {
    return true;
  }
  
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Detect media type from URL
 * @param url - Media URL to check
 * @returns 'video' or 'image'
 */
export const getMediaType = (url: string): 'image' | 'video' => {
  return isVideoUrl(url) ? 'video' : 'image';
};
