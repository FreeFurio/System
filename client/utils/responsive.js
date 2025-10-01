// Responsive utility functions
export const isMobile = () => window.innerWidth <= 768;
export const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
export const isDesktop = () => window.innerWidth > 1024;

// Responsive styles helper
export const responsive = {
  // Padding
  padding: (mobile, desktop = mobile) => isMobile() ? mobile : desktop,
  
  // Font sizes
  fontSize: (mobile, desktop = mobile) => isMobile() ? mobile : desktop,
  
  // Dimensions
  size: (mobile, desktop = mobile) => isMobile() ? mobile : desktop,
  
  // Grid columns
  gridCols: (mobile, desktop = mobile) => isMobile() ? mobile : desktop,
  
  // Gaps
  gap: (mobile, desktop = mobile) => isMobile() ? mobile : desktop
};

// Common responsive breakpoints
export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px'
};