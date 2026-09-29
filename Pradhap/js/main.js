(function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    autoPlayDelay: 5000,
    particleCount: 150,
    particleMaxDist: 150,
    scrollThreshold: 500,
  };

  // ===== PARTICLE BACKGROUND =====
  (function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-bg';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.pulse += this.pulseSpeed;
        const currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
        
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDist = CONFIG.particleMaxDist;
          
          if (distance < maxDist) {
            const force = (maxDist - distance) / maxDist;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.5;
            this.y += Math.sin(angle) * force * 1.5;
          }
        }

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        return currentOpacity;
      }

      draw(opacity) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, `rgba(99, 102, 241, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(236, 72, 153, ${opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(99, 102, 241, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    const particleCount = Math.min(CONFIG.particleCount, Math.floor((window.innerWidth * window.innerHeight) / 8000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    document.addEventListener('mousemove', function(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        const opacity = particle.update();
        particle.draw(opacity);
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < CONFIG.particleMaxDist) {
            const opacity = (1 - distance / CONFIG.particleMaxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('beforeunload', function() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    });
  })();

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('.nav-links a, .btn-primary[href="#contact"], .btn-outline[href="#experience"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ===== DOWNLOAD CV =====
  const downloadBtn = document.getElementById('downloadCvBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      const cvFilePath = "assets/Pradhap_V_CV.pdf";
      const link = document.createElement('a');
      link.href = cvFilePath;
      link.download = "Pradhap_V_CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ===== BACK TO TOP =====
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > CONFIG.scrollThreshold) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== MOBILE HAMBURGER MENU =====
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
      this.setAttribute('aria-expanded', expanded);
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== ACTIVE NAV LINK HIGHLIGHT =====
  const sections = document.querySelectorAll('section[id]');
  const navLinksArray = document.querySelectorAll('.nav-links a');

  if (sections.length > 0 && navLinksArray.length > 0) {
    window.addEventListener('scroll', function() {
      let current = '';
      sections.forEach(function(section) {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });
      
      navLinksArray.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    });
  }

  // ===== 3D MOUSE PARALLAX =====
  (function() {
    const hero = document.querySelector('.hero');
    const heroContent = hero?.querySelector('.hero-content');
    const heroVisual = hero?.querySelector('.hero-visual');
    const floatingElements = document.querySelectorAll('.floating-icon, .depth-layer-2');

    if (hero && heroContent) {
      document.addEventListener('mousemove', function(e) {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        
        heroContent.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        
        if (heroVisual) {
          heroVisual.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
        }
        
        floatingElements.forEach((el, index) => {
          const speed = 0.6 + (index * 0.2);
          el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
      });
    }
  })();

  // ===== SCROLL-TRIGGERED ANIMATIONS =====
  (function() {
    const animatedElements = document.querySelectorAll(
      '.holographic-card, .stat-card, .info-panel, .internship-card, .skill-card'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = index * 150;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
          }, delay);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px) scale(0.95)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      observer.observe(el);
    });
  })();

  // ===== MAGNETIC BUTTON EFFECT =====
  (function() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline, .btn-cv, .slider-btn-unified');

    buttons.forEach(button => {
      if (!button.classList.contains('slider-btn-unified')) {
        button.addEventListener('mousemove', function(e) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          const rotateX = (y / rect.height) * -8;
          const rotateY = (x / rect.width) * 8;
          const translateX = (x / rect.width) * 10;
          const translateY = (y / rect.height) * 10;
          
          this.style.transform = 
            `translate(${translateX * 0.5}px, ${translateY * 0.5}px) ` +
            `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ` +
            `scale(1.05)`;
        });

        button.addEventListener('mouseleave', function() {
          this.style.transform = 'translate(0, 0) rotateX(0) rotateY(0) scale(1)';
        });
      }
    });
  })();

  // ===== KEY PROJECTS — EARTH-LIKE 3D ORBIT =====
  class EarthProjectOrbit {
    constructor() {
      this.slider = document.querySelector('.earth-orbit-projects');
      this.track = this.slider?.querySelector('.earth-orbit-track');
      if (!this.slider || !this.track) return;

      this.slides = Array.from(this.track.querySelectorAll('.slider-slide'));
      // Disable the legacy single-slide state so every project participates in the 3D orbit.
      this.slides.forEach(slide => slide.classList.remove('active'));
      this.total = this.slides.length;
      this.angleStep = 360 / this.total;
      this.radiusX = 430;
      this.radiusZ = 300;
      this.rotation = 0;
      this.targetRotation = 0;
      this.speed = 0.012; // degrees per millisecond — faster continuous orbit
      this.lastTime = performance.now();
      this.hovered = null;
      this.hoverLift = 0;
      this.pointerInside = false;
      this.raf = null;
      this.isMobile = window.matchMedia('(max-width: 700px)').matches;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.bind();
      this.resize();
      this.render(performance.now());
    }

    bind() {
      this.slides.forEach((slide, index) => {
        slide.dataset.projectIndex = index;

        // View More must navigate from the button itself, even though the
        // project cards are continuously transformed by the 3D orbit.
        const viewMore = slide.querySelector('.view-more');
        const projectHref = viewMore?.getAttribute('href');
        if (viewMore) {
          // Keep the visible View More control as a normal link.
          viewMore.addEventListener('pointerdown', (event) => event.stopPropagation());
        }

        // The entire project card is the navigation target. Clicking anywhere
        // on the card (image, title, description, empty card area, etc.) opens
        // that card's corresponding project page. The View More link remains
        // a normal link and is allowed to handle its own click.
        if (projectHref) {
          slide.classList.add('project-card-link');
          slide.setAttribute('role', 'link');
          slide.setAttribute('tabindex', '0');
          slide.setAttribute('aria-label', `Open ${slide.querySelector('h3')?.textContent.trim() || 'project'} details`);
          slide.addEventListener('click', (event) => {
            if (event.target.closest('.view-more, a, button, input, textarea, select')) return;
            window.location.assign(projectHref);
          });
          slide.addEventListener('keydown', (event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.view-more, a, button, input, textarea, select')) {
              event.preventDefault();
              window.location.assign(projectHref);
            }
          });
        }

        slide.addEventListener('mouseenter', () => this.focusCard(index));
        slide.addEventListener('mouseleave', () => {
          this.hovered = null;
          slide.classList.remove('is-hovered');
        });
        slide.addEventListener('focusin', () => this.focusCard(index));
        slide.addEventListener('focusout', () => {
          this.hovered = null;
          slide.classList.remove('is-hovered');
        });
      });

      this.slider.addEventListener('mouseenter', () => { this.pointerInside = true; });
      this.slider.addEventListener('mouseleave', () => {
        this.pointerInside = false;
        this.hovered = null;
        this.slides.forEach(s => s.classList.remove('is-hovered'));
      });

      this.slider.addEventListener('wheel', (e) => {
        if (this.isMobile) return;
        e.preventDefault();
        this.targetRotation += e.deltaY > 0 ? -this.angleStep : this.angleStep;
      }, { passive: false });

      window.addEventListener('resize', () => this.resize(), { passive: true });
    }

    resize() {
      this.isMobile = window.matchMedia('(max-width: 700px)').matches;
      if (this.isMobile) return;
      const width = this.slider.clientWidth;
      this.radiusX = Math.min(470, Math.max(290, width * 0.39));
      this.radiusZ = Math.min(330, Math.max(230, width * 0.28));
    }

    normalizeDelta(deg) {
      return ((deg + 180) % 360 + 360) % 360 - 180;
    }

    focusCard(index) {
      if (this.isMobile || this.reducedMotion) return;
      this.hovered = index;
      this.slides.forEach((s, i) => s.classList.toggle('is-hovered', i === index));

      // Keep the card exactly where it is on the orbit. Hovering only
      // pulls that card toward the viewer on the Z axis; it never rotates
      // the orbit or moves the card to the center.
      this.targetRotation = this.rotation;
    }

    render(now) {
      const dt = Math.min(32, now - this.lastTime);
      this.lastTime = now;

      if (!this.isMobile && !this.reducedMotion) {
        // Auto rotation pauses whenever a card is under the pointer.
        if (this.hovered === null && !this.pointerInside) {
          this.rotation += this.speed * dt;
          this.targetRotation = this.rotation;
        }

        // Keep the orbit stable while hovered. The hovered card is lifted
        // toward the viewer instead of being moved to the center.
        this.hoverLift += (((this.hovered !== null) ? 180 : 0) - this.hoverLift) * Math.min(1, dt / 140);

        const difference = this.normalizeDelta(this.targetRotation - this.rotation);
        if (Math.abs(difference) > 0.02 && this.hovered === null) {
          this.rotation += difference * Math.min(1, dt / 180);
        }

        this.positionCards();
      }

      this.raf = requestAnimationFrame((t) => this.render(t));
    }

    positionCards() {
      this.slides.forEach((slide, index) => {
        const radians = (this.rotation + index * this.angleStep) * Math.PI / 180;
        const x = Math.sin(radians) * this.radiusX;
        const z = Math.cos(radians) * this.radiusZ;
        const depth = (z + this.radiusZ) / (2 * this.radiusZ);
        const isHovered = this.hovered === index;
        const hoverZ = isHovered ? this.hoverLift : 0;
        const scale = 0.68 + depth * 0.32 + (isHovered ? 0.08 * (this.hoverLift / 180) : 0);
        const opacity = Math.min(1, 0.32 + depth * 0.68 + (isHovered ? 0.12 : 0));
        const blur = isHovered ? 0 : Math.max(0, (1 - depth) * 1.5);
        const zIndex = Math.round(depth * 1000) + (isHovered ? 5000 : 0);
        const front = depth > 0.93;

        slide.style.transform = `translate3d(calc(-50% + ${x}px), -50%, ${z + hoverZ}px) scale(${scale})`;
        slide.style.opacity = opacity.toFixed(3);
        slide.style.filter = `blur(${blur.toFixed(2)}px)`;
        slide.style.zIndex = zIndex;
        slide.classList.toggle('is-front', front);
        slide.setAttribute('aria-hidden', depth < 0.05 ? 'true' : 'false');
      });
    }
  }

  // Initialize the orbit after the page has loaded.
  new EarthProjectOrbit();

  // ===== HOLOGRAPHIC CARDS PARALLAX =====
  (function() {
    const cards = document.querySelectorAll('.holographic-card');
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isReducedMotion && cards.length > 0) {
      cards.forEach(card => {
        const layers = card.querySelectorAll('.depth-layer');
        const inner = card.querySelector('.holographic-card-inner');
        
        card.addEventListener('mousemove', function(e) {
          const rect = this.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          
          const rotateX = (y - 0.5) * 8;
          const rotateY = (x - 0.5) * -8;
          this.style.transform = 
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
          
          layers.forEach((layer, index) => {
            const speed = 5 + (index * 3);
            const moveX = (x - 0.5) * speed * 2;
            const moveY = (y - 0.5) * speed * 2;
            layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
          });
          
          if (inner) {
            const lift = (y - 0.5) * 15;
            inner.style.transform = `translateZ(${10 + lift}px)`;
          }
          
          this.style.setProperty('--mouse-x', x * 100 + '%');
          this.style.setProperty('--mouse-y', y * 100 + '%');
          this.style.setProperty('--reflection-opacity', '0.8');
          
          this.style.setProperty('--radial-bg', 
            `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
          );
        });
        
        card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1)';
          this.style.setProperty('--reflection-opacity', '0.5');
          
          layers.forEach(layer => {
            layer.style.transform = 'translate(0, 0)';
          });
          
          if (inner) {
            inner.style.transform = 'translateZ(0)';
          }
        });
      });
    }
    
    // Add dynamic styles for reflection
    const style = document.createElement('style');
    style.textContent = `
      .holographic-card::after {
        background: var(--radial-bg, radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%));
        opacity: var(--reflection-opacity, 0.5);
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 32px;
        pointer-events: none;
        z-index: 2;
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', function(e) {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        cards.forEach(card => {
          card.style.transform = 'translateY(0) scale(1)';
          card.style.transition = 'none';
        });
      }
    });
  })();

  // ===== EMAIL OBFUSCATION =====
  const emailDisplay = document.getElementById('email-display');
  if (emailDisplay) {
    const user = 'veerapradhap';
    const domain = 'gmail.com';
    emailDisplay.textContent = user + '@' + domain;
  }

  // ===== PROJECT VIEW-MORE NAVIGATION =====
  // View More uses normal same-tab anchors. No global click interception is used,
  // so the browser handles navigation directly from each project card.

  // ===== INITIALIZE SLIDER =====
  document.addEventListener('DOMContentLoaded', function() {
    new ProjectSlider();
  });

})();