/**
 * ERICON Official Logo Supplier
 * Automatically retrieves the user's high-fidelity custom brand logo from Google Drive.
 * Preloads the logo image client-side to dynamically generate a local base64 Data URL.
 */

// Exact Google Drive static logo URL requested by the inventor
export const GOOGLE_DRIVE_LOGO_URL = 'https://drive.google.com/thumbnail?id=1yMBnZMQQwm1AcsWehQmlQtL_OoFDB7aC&sz=w1000';

let cachedBase64Logo: string | null = null;
let logoWidth = 162;
let logoHeight = 186;
let logoAspectRatio = 162 / 186; // Native aspect ratio is approx 0.871
let ratioLoaded = false;

/**
 * Preloads the custom ERICON brand logo image from Google Drive on startup.
 * Converts it to a secure Base64 data URL in the client's browser if CORS permits,
 * or defaults gracefully to the public direct Google Drive URL.
 */
export const preloadEriconLogo = (imgUrl?: string) => {
  const urlToLoad = imgUrl || '/api/ericon-logo';
  
  if (typeof window === 'undefined') return;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  // Bulletproof fetch pattern to avoid CORS tainting
  fetch(urlToLoad)
    .then((res) => {
      if (!res.ok) throw new Error('Proxy returned HTTP error status');
      return res.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
    })
    .catch((err) => {
      console.warn('[ERICON BRANDING] Direct blob fetch failed, falling back to traditional image loading:', err);
      // Fallback: load the source direct on the image object (might taint but acts as robust fallback)
      img.src = urlToLoad;
    });

  img.onload = () => {
    try {
      const rawW = img.naturalWidth || img.width || 162;
      const rawH = img.naturalHeight || img.height || 186;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = rawW;
      tempCanvas.height = rawH;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0);
        
        // Scan pixels to trim excess Google Drive blank white padding.
        // We ignore the outermost boundary margin of the image when scanning for the logo coordinates.
        // This completely avoids hitting any thumbnail border frames, shadows or vignettes from Google Drive.
        const imgData = tempCtx.getImageData(0, 0, rawW, rawH);
        const data = imgData.data;
        let minX = rawW;
        let maxX = 0;
        let minY = rawH;
        let maxY = 0;

        const scanMargin = Math.min(25, Math.floor(Math.min(rawW, rawH) * 0.08)); 

        for (let y = scanMargin; y < rawH - scanMargin; y++) {
          for (let x = scanMargin; x < rawW - scanMargin; x++) {
            const idx = (y * rawW + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            // Background of Google Drive thumbnails is off-white (RGB around 240-245).
            // A threshold of 225 is extremely secure to categorize any light/blank pixels as padding.
            const isWhitePadding = (r > 220 && g > 220 && b > 220) || a < 30;

            if (!isWhitePadding) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // Safety fallback: if no content pixels found inside, use raw outer edges
        if (maxX < minX || maxY < minY) {
          minX = scanMargin;
          maxX = rawW - scanMargin;
          minY = scanMargin;
          maxY = rawH - scanMargin;
        }

        let croppedCanvas = tempCanvas;
        if (maxX >= minX && maxY >= minY) {
          // Add comfortable padding around the logo graphics for absolute brand balance
          const padding = 2; // tight precision crop for zero extra whitespace
          const cropX = Math.max(0, minX - padding);
          const cropY = Math.max(0, minY - padding);
          const cropW = Math.min(rawW - cropX, maxX - minX + 1 + padding * 2);
          const cropH = Math.min(rawH - cropY, maxY - minY + 1 + padding * 2);

          croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = cropW;
          croppedCanvas.height = cropH;
          const croppedCtx = croppedCanvas.getContext('2d');
          if (croppedCtx) {
            // Extract the cropped region but do NOT hollow out or make white pixels transparent.
            // This preserves the solid white grid cells and high-contrast bounding boxes of the official logo,
            // while discarding the broad outer padding.
            croppedCtx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          } else {
            croppedCanvas = tempCanvas;
          }
        }

        logoWidth = croppedCanvas.width;
        logoHeight = croppedCanvas.height;
        logoAspectRatio = logoWidth / logoHeight;
        ratioLoaded = true;

        cachedBase64Logo = croppedCanvas.toDataURL('image/png');
        console.log('[ERICON BRANDING] Automatically trimmed Google Drive white padding. Perfect ratio:', logoAspectRatio, `${logoWidth}x${logoHeight}`);
        
        // Notify components reactively that the perfect cropped logo is loaded and compiled
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ericon-logo-loaded'));
        }
      }
    } catch (e) {
      console.warn('[ERICON BRANDING] Canvas serialization was protected by CORS/tainting. Utilizing original direct URL path.', e);
    }
  };

  img.onerror = (err) => {
    console.error('[ERICON BRANDING] Error loading custom Google Drive brand logo from proxy, falling back to direct URL:', urlToLoad, err);
    if (urlToLoad === '/api/ericon-logo') {
      preloadEriconLogo(GOOGLE_DRIVE_LOGO_URL);
    }
  };
};

/**
 * Returns the high-fidelity ERICON logo.
 * Prefers the cached, zero-flicker Base64 Data URL to allow synchronous PDF compilation and canvas drawings,
 * and falls back to the local proxy URL or direct Google Drive URL path.
 */
export const getEriconLogoDataUrl = (width = 400, height = 460, transparent = true): string => {
  return cachedBase64Logo || '/api/ericon-logo';
};

/**
 * Gets the current calculated aspect ratio of the logo (width / height).
 */
export const getLogoAspectRatio = (): number => {
  return logoAspectRatio;
};

/**
 * Calculates proportional fit dimensions for the ERICON logo to prevent stretching/squashing.
 */
export const getLogoFitDimensions = (
  maxW: number,
  maxH: number,
  mode: 'width' | 'height' | 'contain' = 'contain'
): { width: number; height: number } => {
  const ratio = getLogoAspectRatio();
  
  if (mode === 'width') {
    return { width: maxW, height: maxW / ratio };
  }
  if (mode === 'height') {
    return { width: maxH * ratio, height: maxH };
  }
  
  // mode is 'contain' - must fit in both maxW and maxH
  const targetRatio = maxW / maxH;
  if (ratio > targetRatio) {
    // width is the constraint
    return { width: maxW, height: maxW / ratio };
  } else {
    // height is the constraint
    return { width: maxH * ratio, height: maxH };
  }
};
