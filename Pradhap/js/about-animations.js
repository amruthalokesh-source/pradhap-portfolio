import { animate, waapi, splitText } from 'https://cdn.jsdelivr.net/npm/animejs/+esm';

(function () {
  'use strict';

  const about = document.querySelector('#about');
  if (!about) return;

  const cards = Array.from(about.querySelectorAll('.about-stats .stat-card'));
  const paragraphs = Array.from(about.querySelectorAll('.about-text > p'));
  if (!cards.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Split each About paragraph into visual lines once. The lines are then animated
  // as complete units whenever the About section is entered.
  const lineSplits = paragraphs.map((paragraph) => {
    return splitText(paragraph, {
      lines: { wrap: 'clip' }
    });
  });

  const getLines = () => lineSplits.flatMap(split => split.lines || []);
  const getAllAnimatedElements = () => [...cards, ...getLines()];

  const resetAnimationState = () => {
    if (reducedMotion) {
      getAllAnimatedElements().forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-17rem) rotate(-360deg)';
    });

    getLines().forEach(line => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(100%)';
    });
  };

  const playCards = () => {
    if (reducedMotion) return Promise.resolve();

    // Card 1 — supplied Anime.js style: inOut
    const first = cards[0]
      ? animate(cards[0], {
          x: '17rem',
          rotate: 360,
          opacity: [0, 1],
          ease: 'inOut',
          duration: 1100,
        })
      : null;

    // Card 2 — supplied Anime.js style: inOut(3)
    const second = cards[1]
      ? animate(cards[1], {
          x: '17rem',
          rotate: 360,
          opacity: [0, 1],
          ease: 'inOut(3)',
          duration: 1100,
          delay: 180,
        })
      : null;

    // Card 3 — supplied Anime.js WAAPI style: inOutExpo
    const third = cards[2]
      ? waapi.animate(cards[2], {
          x: '17rem',
          rotate: 360,
          opacity: [0, 1],
          ease: 'inOutExpo',
          duration: 1100,
          delay: 360,
        })
      : null;

    const animations = [first, second, third].filter(Boolean);
    return Promise.all(animations.map(animation =>
      animation.finished ? animation.finished : Promise.resolve()
    ));
  };

  const playTextLines = () => {
    const lines = getLines();
    if (!lines.length || reducedMotion) return Promise.resolve();

    return animate(lines, {
      y: ['100%', '0%'],
      opacity: [0, 1],
      duration: 650,
      ease: 'out(3)',
      delay: (_, index) => index * 120,
    });
  };

  let runId = 0;
  let isInside = false;

  const playAboutAnimation = async () => {
    const currentRun = ++runId;
    resetAnimationState();

    if (reducedMotion) return;

    await playCards();
    if (currentRun !== runId || !isInside) return;

    await playTextLines();
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const entering = entry.isIntersecting && entry.intersectionRatio >= 0.18;

      if (entering && !isInside) {
        isInside = true;
        playAboutAnimation();
      } else if (!entering && isInside) {
        isInside = false;
        runId++;
        resetAnimationState();
      }
    });
  }, {
    threshold: [0, 0.18, 0.35],
    rootMargin: '0px 0px -8% 0px'
  });

  resetAnimationState();
  observer.observe(about);
})();
