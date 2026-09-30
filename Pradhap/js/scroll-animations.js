(function () {
  'use strict';

  const sections = Array.from(document.querySelectorAll('main > section'));
  if (!sections.length) return;

  let hasScrolled = false;
  let activeSection = null;
  let globalRestartTimer = null;

  const video = document.querySelector('.hero-background-video');
  const globalAnimated = Array.from(document.querySelectorAll('.animated-bg, .glow-ring'));

  function restartGlobalEffects() {
    globalAnimated.forEach((el) => {
      const previous = el.style.animation;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = previous;
    });

    if (globalRestartTimer) clearTimeout(globalRestartTimer);
    globalRestartTimer = setTimeout(() => {
      globalAnimated.forEach((el) => {
        if (!activeSection) el.style.animation = 'none';
      });
    }, 50);
  }

  function resetSection(section) {
    section.classList.remove('is-active');
  }

  function activateSection(section) {
    if (!hasScrolled || activeSection === section) return;

    if (activeSection) resetSection(activeSection);
    activeSection = section;
    section.classList.add('is-active');

    // Hero video should only run while Hero is the visible section.
    if (video) {
      if (section.classList.contains('hero')) {
        try { video.currentTime = 0; } catch (_) {}
        video.play().catch(() => {});
      } else {
        video.pause();
        try { video.currentTime = 0; } catch (_) {}
      }
    }

    restartGlobalEffects();
  }

  function deactivateAll() {
    sections.forEach(resetSection);
    activeSection = null;
    if (video) {
      video.pause();
      try { video.currentTime = 0; } catch (_) {}
    }
    globalAnimated.forEach((el) => { el.style.animation = 'none'; });
  }

  // Keep the page visually still on first load. The first real scroll engages
  // the section animation system.
  deactivateAll();

  window.addEventListener('scroll', function () {
    if (!hasScrolled) {
      hasScrolled = true;
      document.body.classList.add('scroll-motion-engaged');
      // Do not activate anything until IntersectionObserver gives us the
      // currently visible section; this prevents a load-time animation burst.
    }
  }, { passive: true, once: true });

  const observer = new IntersectionObserver((entries) => {
    if (!hasScrolled) return;

    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible && visible.intersectionRatio >= 0.22) {
      activateSection(visible.target);
    }
  }, {
    threshold: [0, 0.22, 0.4, 0.6],
    rootMargin: '-8% 0px -12% 0px'
  });

  sections.forEach(section => observer.observe(section));

  // Re-evaluate after smooth-scroll/navigation jumps.
  window.addEventListener('resize', () => {
    if (!hasScrolled) return;
    const current = sections
      .map(section => ({ section, rect: section.getBoundingClientRect() }))
      .filter(item => item.rect.top < window.innerHeight * 0.78 && item.rect.bottom > window.innerHeight * 0.12)
      .sort((a, b) => {
        const ac = Math.abs((a.rect.top + a.rect.bottom) / 2 - window.innerHeight / 2);
        const bc = Math.abs((b.rect.top + b.rect.bottom) / 2 - window.innerHeight / 2);
        return ac - bc;
      })[0];
    if (current) activateSection(current.section);
  }, { passive: true });
})();
