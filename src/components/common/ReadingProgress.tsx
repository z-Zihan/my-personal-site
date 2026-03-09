import React, { useEffect, useState, useRef } from 'react';
import { trackEvent } from '../../utils/analytics';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const hasTracked25 = useRef(false);
  const hasTracked50 = useRef(false);
  const hasTracked75 = useRef(false);
  const hasTracked100 = useRef(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);

      // 阅读进度埋点
      if (scrollPercent >= 25 && !hasTracked25.current) {
        hasTracked25.current = true;
        trackEvent('reading_progress', 'engagement', {
          progress: 25,
          page_path: window.location.pathname,
        });
      }
      if (scrollPercent >= 50 && !hasTracked50.current) {
        hasTracked50.current = true;
        trackEvent('reading_progress', 'engagement', {
          progress: 50,
          page_path: window.location.pathname,
        });
      }
      if (scrollPercent >= 75 && !hasTracked75.current) {
        hasTracked75.current = true;
        trackEvent('reading_progress', 'engagement', {
          progress: 75,
          page_path: window.location.pathname,
        });
      }
      if (scrollPercent >= 95 && !hasTracked100.current) {
        hasTracked100.current = true;
        trackEvent('reading_complete', 'engagement', {
          progress: 100,
          page_path: window.location.pathname,
        });
      }
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 dark:bg-gray-800">
      <div
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
