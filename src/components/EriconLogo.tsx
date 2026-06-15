import React, { useState, useEffect } from 'react';
import { getEriconLogoDataUrl, getLogoAspectRatio } from '../utils/ericonLogoDraw';

interface EriconLogoProps {
  /**
   * Compact: header size (approx 40px).
   * Standard: card headers (approx 80px).
   * Large: login page, high-impact panels (approx 160px+).
   * Header: specifically scaled to match the app header text lines (spans block height).
   * Preservation: display ERICON logo in large, uncropped original aspect ratio with visible micro-trends.
   */
  size?: 'compact' | 'standard' | 'large' | 'header' | 'preservation';
  /**
   * Unused after text removal but preserved to prevent TS/compilation errors in consuming components.
   */
  showText?: boolean;
  /**
   * Placement of the text relative to the graphic logo.
   */
  textPosition?: 'bottom' | 'right';
  /**
   * Additional tailwind classes applied to the outer container.
   */
  className?: string;
  /**
   * Interactive hover effect (rodent wiggling whiskers/glowing background).
   */
  interactive?: boolean;
}

export const EriconLogo: React.FC<EriconLogoProps> = ({
  size = 'standard',
  showText = false,
  textPosition = 'right',
  className = '',
  interactive = true,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(getEriconLogoDataUrl());
  const [aspectRatio, setAspectRatio] = useState<number>(getLogoAspectRatio());

  useEffect(() => {
    // Dynamic update handler for reactive logo preloading
    const handleLogoUpdate = () => {
      setLogoSrc(getEriconLogoDataUrl());
      setAspectRatio(getLogoAspectRatio());
    };

    // Initialize with current loaded parameters
    handleLogoUpdate();

    // Subscribe to custom event dispatched when high-fidelity trimmed on-the-fly logo is ready
    window.addEventListener('ericon-logo-loaded', handleLogoUpdate);

    // Fallback: Also try loading directly on an image element as a fail-safe
    const img = new Image();
    img.src = getEriconLogoDataUrl();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };

    return () => {
      window.removeEventListener('ericon-logo-loaded', handleLogoUpdate);
    };
  }, []);

  const logoHeights = {
    compact: 'h-[52px] md:h-[56px]',
    standard: 'h-[88px] md:h-[96px]',
    large: 'h-32 md:h-36',
    header: 'h-[48px] md:h-[52px]',
    preservation: 'h-80 md:h-[340px]',
  };

  const logoHeightClass = logoHeights[size] || logoHeights.standard;

  return (
    <div 
      className={`inline-flex items-center justify-center font-mono select-none ${className}`}
      id="ericon-branding-logo-wrapper"
    >
      <a
        href="#/"
        className={`relative ${logoHeightClass} group flex items-center justify-center overflow-hidden rounded-lg bg-white border border-slate-200 dark:border-slate-800 shadow-sm p-1.5`}
        style={{
          width: 'auto',
          aspectRatio: `${aspectRatio}`,
        }}
        id="ericon-vector-graphic-box"
      >
        <img
          src={logoSrc}
          alt="Official ERICON Logo"
          className="h-full w-auto max-w-full max-h-full pointer-events-none transition-transform duration-300 group-hover:scale-[1.06] object-contain bg-white"
          referrerPolicy="no-referrer"
          id="ericon-logo-master-image"
        />
      </a>
    </div>
  );
};


