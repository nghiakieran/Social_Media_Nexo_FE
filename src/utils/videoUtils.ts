/**
 * Generate thumbnail from video URL
 * Creates a thumbnail from the first frame of the video
 */
export const generateVideoThumbnail = (
  videoUrl: string,
  timeInSeconds: number = 0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Cannot get canvas context'));
      return;
    }

    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;

    video.addEventListener('loadeddata', () => {
      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to the specified time
      video.currentTime = timeInSeconds;
    });

    video.addEventListener('seeked', () => {
      try {
        // Draw the current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Clean up
        video.src = '';
        video.load();
        
        resolve(thumbnailUrl);
      } catch (error) {
        reject(error);
      }
    });

    video.addEventListener('error', (e) => {
      reject(new Error('Error loading video for thumbnail generation'));
    });

    video.src = videoUrl;
  });
};

/**
 * Cache for video thumbnails to avoid regenerating
 */
const thumbnailCache = new Map<string, string>();

/**
 * Get video thumbnail with caching
 */
export const getVideoThumbnail = async (
  videoUrl: string,
  timeInSeconds: number = 0
): Promise<string | null> => {
  const cacheKey = `${videoUrl}-${timeInSeconds}`;
  
  // Check cache first
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  try {
    const thumbnail = await generateVideoThumbnail(videoUrl, timeInSeconds);
    thumbnailCache.set(cacheKey, thumbnail);
    return thumbnail;
  } catch (error) {
    return null;
  }
};

/**
 * Clear thumbnail cache
 */
export const clearThumbnailCache = () => {
  thumbnailCache.clear();
};
