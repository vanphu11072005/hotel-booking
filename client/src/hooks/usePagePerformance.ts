import { useEffect, useRef } from 'react';

/**
 * Custom hook for monitoring page performance
 * Logs page load times in development mode
 * @param pageName - Name of the page/component to monitor
 */
function usePagePerformance(pageName: string) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const loadTime = Date.now() - startTimeRef.current;
      console.log(
        `[Performance] ${pageName} loaded in ${loadTime}ms`
      );

      // Report Web Vitals if available
      if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime =
          perfData.loadEventEnd - perfData.navigationStart;
        console.log(
          `[Performance] ${pageName} total page load: ` +
          `${pageLoadTime}ms`
        );
      }
    }
  }, [pageName]);

  return null;
}

export default usePagePerformance;
