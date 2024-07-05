/**
 * Web Vitals Performance Monitoring
 * 
 * This utility function measures and reports Core Web Vitals metrics
 * to help monitor the application's performance in production.
 * 
 * Metrics tracked:
 * - CLS: Cumulative Layout Shift
 * - FID: First Input Delay  
 * - FCP: First Contentful Paint
 * - LCP: Largest Contentful Paint
 * - TTFB: Time to First Byte
 */

const reportWebVitals = onPerfEntry => {
  // Only execute if a valid performance entry callback is provided
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import web-vitals library to avoid impacting bundle size
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Measure and report each Core Web Vital metric
      getCLS(onPerfEntry);    // Visual stability
      getFID(onPerfEntry);    // Interactivity
      getFCP(onPerfEntry);    // Loading performance
      getLCP(onPerfEntry);    // Loading performance
      getTTFB(onPerfEntry);   // Server responsiveness
    });
  }
};

export default reportWebVitals;
