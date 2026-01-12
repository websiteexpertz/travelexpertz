// Responsive utilities and hooks for React components

import { useState, useEffect } from 'react';

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Hook to detect current breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<keyof typeof breakpoints>('lg');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize({
        width,
        height: window.innerHeight,
      });

      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { breakpoint, windowSize };
};

// Hook to check if mobile
export const useIsMobile = () => {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

// Hook to check if tablet
export const useIsTablet = () => {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'md';
};

// Hook to check if desktop
export const useIsDesktop = () => {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
};

// Get responsive value based on breakpoint
export const getResponsiveValue = <T,>(
  values: Partial<Record<keyof typeof breakpoints, T>>,
  currentBreakpoint: keyof typeof breakpoints
): T | undefined => {
  const orderedBreakpoints: (keyof typeof breakpoints)[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  const breakpointIndex = orderedBreakpoints.indexOf(currentBreakpoint);
  
  for (let i = breakpointIndex; i < orderedBreakpoints.length; i++) {
    const bp = orderedBreakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
};

// Hook for responsive values
export const useResponsiveValue = <T,>(
  values: Partial<Record<keyof typeof breakpoints, T>>
): T | undefined => {
  const { breakpoint } = useBreakpoint();
  return getResponsiveValue(values, breakpoint);
};

// Media query helpers for CSS-in-JS
export const mediaQuery = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  maxSm: `@media (max-width: ${breakpoints.sm - 1}px)`,
  maxMd: `@media (max-width: ${breakpoints.md - 1}px)`,
  maxLg: `@media (max-width: ${breakpoints.lg - 1}px)`,
  maxXl: `@media (max-width: ${breakpoints.xl - 1}px)`,
};

// Responsive container max widths
export const containerMaxWidth = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Get container max width for current breakpoint
export const useContainerMaxWidth = () => {
  const { breakpoint } = useBreakpoint();
  return containerMaxWidth[breakpoint];
};

// Responsive padding/margin scale
export const spacing = {
  xs: 'clamp(0.25rem, 0.5vw, 0.5rem)',
  sm: 'clamp(0.5rem, 1vw, 0.75rem)',
  md: 'clamp(0.75rem, 1.5vw, 1rem)',
  lg: 'clamp(1rem, 2vw, 1.5rem)',
  xl: 'clamp(1.5rem, 3vw, 2rem)',
  '2xl': 'clamp(2rem, 4vw, 3rem)',
  '3xl': 'clamp(3rem, 6vw, 4rem)',
};

// Responsive font sizes
export const fontSize = {
  xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
  sm: 'clamp(0.875rem, 0.8rem + 0.5vw, 1rem)',
  base: 'clamp(1rem, 0.95rem + 0.5vw, 1.125rem)',
  lg: 'clamp(1.125rem, 1rem + 0.75vw, 1.25rem)',
  xl: 'clamp(1.25rem, 1.1rem + 1vw, 1.5rem)',
  '2xl': 'clamp(1.5rem, 1.3rem + 1.5vw, 2rem)',
  '3xl': 'clamp(1.875rem, 1.5rem + 2vw, 2.5rem)',
  '4xl': 'clamp(2.25rem, 1.8rem + 3vw, 3rem)',
  '5xl': 'clamp(3rem, 2.5rem + 4vw, 4rem)',
};

// Touch-friendly minimum sizes
export const touchTarget = {
  minHeight: '44px',
  minWidth: '44px',
};

// Responsive grid columns
export const gridColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
};

// Get grid columns based on breakpoint
export const useGridColumns = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  wide: number = 4
) => {
  const { breakpoint } = useBreakpoint();
  
  if (breakpoint === 'xs' || breakpoint === 'sm') return mobile;
  if (breakpoint === 'md') return tablet;
  if (breakpoint === 'lg' || breakpoint === 'xl') return desktop;
  return wide;
};

// Responsive styles object generator
export const createResponsiveStyles = (
  baseStyles: React.CSSProperties,
  mobileOverrides?: React.CSSProperties,
  tabletOverrides?: React.CSSProperties,
  desktopOverrides?: React.CSSProperties
) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  if (isMobile && mobileOverrides) {
    return { ...baseStyles, ...mobileOverrides };
  }
  if (isTablet && tabletOverrides) {
    return { ...baseStyles, ...tabletOverrides };
  }
  if (desktopOverrides) {
    return { ...baseStyles, ...desktopOverrides };
  }
  
  return baseStyles;
};

// Hook for window dimensions
export const useWindowDimensions = () => {
  const { windowSize } = useBreakpoint();
  return windowSize;
};

// Check if touch device
export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  }, []);
  
  return isTouch;
};

// Orientation detection
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };
    
    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);
  
  return orientation;
};

// Calculate responsive value with linear interpolation
export const fluidValue = (
  minSize: number,
  maxSize: number,
  minViewport: number = 320,
  maxViewport: number = 1280
) => {
  const slope = (maxSize - minSize) / (maxViewport - minViewport);
  const yIntercept = minSize - slope * minViewport;
  
  return `clamp(${minSize}px, ${yIntercept}px + ${slope * 100}vw, ${maxSize}px)`;
};
