import { useState, useEffect } from 'react';

interface ResponsiveValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';
  width: number;
  height: number;
}

// Tailwind CSS breakpoints
const BREAKPOINTS = {
  sm: 640,    // Small devices (landscape phones, 640px and up)
  md: 768,    // Medium devices (tablets, 768px and up)
  lg: 1024,   // Large devices (desktops, 1024px and up)
  xl: 1280,   // Extra large devices (large desktops, 1280px and up)
  '2xl': 1536 // 2X Extra large devices (larger desktops, 1536px and up)
} as const;

export function useResponsive(): ResponsiveValues {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  const isMobile = windowSize.width < BREAKPOINTS.sm;
  const isTablet = windowSize.width >= BREAKPOINTS.sm && windowSize.width < BREAKPOINTS.lg;
  const isDesktop = windowSize.width >= BREAKPOINTS.lg && windowSize.width < BREAKPOINTS.xl;
  const isLargeDesktop = windowSize.width >= BREAKPOINTS.xl;

  let screenSize: 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';
  if (isMobile) screenSize = 'mobile';
  else if (isTablet) screenSize = 'tablet';
  else if (isDesktop) screenSize = 'desktop';
  else screenSize = 'largeDesktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    screenSize,
    width: windowSize.width,
    height: windowSize.height,
  };
}

// Utility hook for checking specific breakpoints
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

// Utility hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

// Utility hook for orientation
export function useOrientation(): 'portrait' | 'landscape' {
  const { width, height } = useResponsive();
  return height > width ? 'portrait' : 'landscape';
}

// Utility hook for touch devices
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - Old IE
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouchDevice;
}