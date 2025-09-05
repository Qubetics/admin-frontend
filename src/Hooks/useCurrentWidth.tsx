import { useState, useEffect } from 'react';

const getWidth = () =>
  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

export default function useCurrentWidth() {
  const [width, setWidth] = useState(getWidth());

  useEffect(() => {
    let timeoutId: any | null = null ;
    const resizeListener = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => setWidth(getWidth()), 150);
    };

    window.addEventListener('resize', resizeListener);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  return width;
}
