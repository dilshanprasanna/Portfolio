import { useEffect, useMemo, useState, type CSSProperties } from 'react';

type HeroButton = {
  id: string;
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'link';
  visible: boolean;
  order: number;
};

type HeroFeatures = {
  typingAnimation: boolean;
  animatedParticles: boolean;
  smoothEntranceAnimation: boolean;
  responsiveDesign: boolean;
};

type HeroInteractiveProps = {
  headline: string;
  subHeadline: string;
  introductionText: string;
  typingAnimationTextList: string[];
  profileImage: string;
  buttons: HeroButton[];
  features: HeroFeatures;
};

function useTypingText(items: string[], enabled: boolean) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!enabled || items.length === 0) return;

    const current = items[index % items.length];
    const speed = deleting ? 35 : 60;
    const timeout = window.setTimeout(() => {
      const nextLength = deleting ? text.length - 1 : text.length + 1;
      const nextText = current.slice(0, nextLength);
      setText(nextText);

      if (!deleting && nextText === current) {
        window.setTimeout(() => setDeleting(true), 1200);
      } else if (deleting && nextText === '') {
        setDeleting(false);
        setIndex((value) => (value + 1) % items.length);
      }
    }, speed);

    return () => window.clearTimeout(timeout);
  }, [deleting, enabled, index, items, text]);

  return text || items[0] || '';
}

export default function HeroInteractive({
  headline,
  subHeadline,
  introductionText,
  typingAnimationTextList,
  profileImage,
  buttons,
  features
}: HeroInteractiveProps) {
  const visibleButtons = useMemo(
    () => [...buttons].filter((button) => button.visible).sort((a, b) => a.order - b.order),
    [buttons]
  );
  const typedText = useTypingText(typingAnimationTextList, features.typingAnimation);
  const particleCount = features.animatedParticles ? 12 : 0;

  return (
    <section id="home" className={`hero hero-section ${features.smoothEntranceAnimation ? 'is-animated' : ''}`}>
      <div className="hero-copy">
        <p className="eyebrow">Portfolio scaffold initialized</p>
        <h1>{headline}</h1>
        <p className="hero-subheadline">{subHeadline}</p>
        <p className="hero-intro">{introductionText}</p>

        <div className="typing-line" aria-live="polite" aria-atomic="true">
          <span className="typing-label">I am a</span>
          <span className="typing-text">{typedText}</span>
        </div>

        <div className="hero-actions">
          {visibleButtons.map((button) => (
            <a key={button.id} href={button.href} className={`cta cta-${button.variant}`}>
              {button.label}
            </a>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-frame">
          <div className="hero-glow" aria-hidden="true" />
          <img
            src={profileImage}
            alt="Profile portrait"
            className="hero-image"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            Available for select projects
          </div>
        </div>

        {particleCount > 0 ? (
          <div className="hero-particles" aria-hidden="true">
            {Array.from({ length: particleCount }).map((_, index) => (
              <span
                key={index}
                className="hero-particle"
                style={{ '--particle-delay': `${index * 0.35}s`, '--i': index } as CSSProperties}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
