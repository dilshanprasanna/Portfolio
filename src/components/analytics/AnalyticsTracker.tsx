import { useEffect } from 'react';
import { logPortfolioEvent } from '../../lib/supabase';

type AnalyticsTrackerProps = {
  sectionIds: string[];
};

export default function AnalyticsTracker({ sectionIds }: AnalyticsTrackerProps) {
  useEffect(() => {
    const seen = new Set<string>();
    void logPortfolioEvent('page_view', {
      path: window.location.pathname,
      title: document.title
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void logPortfolioEvent('page_hidden', { path: window.location.pathname });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sectionId = entry.target.id;
          if (!sectionId || seen.has(sectionId)) return;
          seen.add(sectionId);
          void logPortfolioEvent('section_view', { section: sectionId });
        });
      },
      { rootMargin: '0px 0px -55% 0px', threshold: 0.25 }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
    };
  }, [sectionIds]);

  return null;
}
