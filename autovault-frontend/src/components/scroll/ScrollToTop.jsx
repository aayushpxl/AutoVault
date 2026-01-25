// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo({
      top: 0,
      behavior: 'auto', // or 'auto' if you don't want animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
