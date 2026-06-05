import { useEffect, useMemo, useState } from 'react';

type NavItem = {
  id: string;
  label: string;
  href: string;
  sectionKey: string;
  visible: boolean;
  order: number;
  icon?: string;
  type?: string;
};

type ThemeTokens = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  animationSpeed: string;
  darkModeColors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  lightModeColors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
};

type NavigationProps = {
  items: NavItem[];
  theme: ThemeTokens;
};

const themeKey = 'portfolio-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(themeKey);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function Navigation({ items, theme }: NavigationProps) {
  const visibleItems = useMemo(
    () => [...items].filter((item) => item.visible).sort((a, b) => a.order - b.order),
    [items]
  );
  const [activeId, setActiveId] = useState(visibleItems[0]?.sectionKey ?? 'hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeMode;
    window.localStorage.setItem(themeKey, themeMode);
    root.style.setProperty('--theme-bg', themeMode === 'dark' ? theme.darkModeColors.background : theme.lightModeColors.background);
    root.style.setProperty('--theme-surface', themeMode === 'dark' ? theme.darkModeColors.surface : theme.lightModeColors.surface);
    root.style.setProperty('--theme-text', themeMode === 'dark' ? theme.darkModeColors.text : theme.lightModeColors.text);
    root.style.setProperty('--theme-muted', themeMode === 'dark' ? theme.darkModeColors.muted : theme.lightModeColors.muted);
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-font', theme.fontFamily);
    root.style.setProperty('--theme-radius', theme.borderRadius);
  }, [theme, themeMode]);

  useEffect(() => {
    const sections = visibleItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-28% 0px -58% 0px',
        threshold: [0.12, 0.24, 0.4, 0.6, 0.8]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [visibleItems]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleTheme = () => {
    setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleNavigate = () => {
    setMobileOpen(false);
  };

  return (
    <header className="site-header">
      <script
        dangerouslySetInnerHTML={{
          __html: `(() => { try { const key = '${themeKey}'; const stored = localStorage.getItem(key); const preferred = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); document.documentElement.dataset.theme = preferred; } catch (error) {} })();`
        }}
      />
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#home" onClick={handleNavigate}>
          <span className="brand-mark" aria-hidden="true" />
          <span>Portfolio</span>
        </a>

        <div id="primary-navigation" className={`nav-links ${mobileOpen ? 'is-open' : ''}`}>
          {visibleItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={activeId === item.sectionKey ? 'is-active' : ''}
              aria-current={activeId === item.sectionKey ? 'page' : undefined}
              onClick={handleNavigate}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
            {themeMode === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((current) => !current)}
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}
