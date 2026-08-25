(function() {
  'use strict';

  // ===== LOADER =====
  window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(function() {
        loader.classList.add('hidden');
      }, 600);
    }
  });

  // ===== PARTICLE BACKGROUND (Canvas) =====
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
          const maxDist = 150;
          
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

    const particleCount = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 8000));
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
          
          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.15;
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
      if (window.scrollY > 500) {
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

  // ===== ENHANCED 3D MOUSE PARALLAX =====
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

  // ===== PROJECT SLIDER =====
  class ProjectSlider {
    constructor() {
      this.slider = document.querySelector('.project-slider');
      if (!this.slider) return;

      this.slides = this.slider.querySelectorAll('.slider-slide');
      this.dots = this.slider.querySelectorAll('.dot');
      this.progressBar = this.slider.querySelector('.slider-progress-bar');
      this.prevBtn = this.slider.querySelector('.slider-btn-unified.prev');
      this.nextBtn = this.slider.querySelector('.slider-btn-unified.next');
      this.currentSlideDisplay = this.slider.querySelector('.current-slide-unified');

      this.currentIndex = 0;
      this.totalSlides = this.slides.length;
      this.isAnimating = false;
      this.autoPlayInterval = null;
      this.autoPlayDelay = 5000;

      this.init();
    }

    init() {
      this.goTo(0);

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goTo(index));
      });

      document.addEventListener('keydown', (e) => {
        const rect = this.slider.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          if (e.key === 'ArrowLeft') this.prev();
          if (e.key === 'ArrowRight') this.next();
        }
      });

      let touchStartX = 0;
      let touchEndX = 0;

      this.slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) this.next();
          else this.prev();
        }
      }, { passive: true });

      let wheelTimeout = false;
      this.slider.addEventListener('wheel', (e) => {
        if (wheelTimeout) return;
        wheelTimeout = true;
        setTimeout(() => { wheelTimeout = false; }, 800);
        
        if (e.deltaY > 0) {
          this.next();
        } else if (e.deltaY < 0) {
          this.prev();
        }
      }, { passive: true });

      this.startAutoPlay();
      this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
      this.slider.addEventListener('focusin', () => this.stopAutoPlay());
      this.slider.addEventListener('focusout', () => this.startAutoPlay());
    }

    goTo(index) {
      if (this.isAnimating || index === this.currentIndex) return;
      
      if (index < 0) index = this.totalSlides - 1;
      if (index >= this.totalSlides) index = 0;

      this.isAnimating = true;

      this.slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
          slide.classList.add('active');
          const animatedElements = slide.querySelectorAll(
            '.project-tech-stack.compact span, .feature-item.compact'
          );
          animatedElements.forEach((el) => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = '';
          });
        }
      });

      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      if (this.progressBar) {
        const progress = ((index + 1) / this.totalSlides) * 100;
        this.progressBar.style.width = progress + '%';
      }

      if (this.currentSlideDisplay) {
        this.currentSlideDisplay.textContent = index + 1;
      }

      this.currentIndex = index;

      setTimeout(() => {
        this.isAnimating = false;
      }, 600);
    }

    prev() {
      this.goTo(this.currentIndex - 1);
    }

    next() {
      this.goTo(this.currentIndex + 1);
    }

    startAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
      this.autoPlayInterval = setInterval(() => {
        this.next();
      }, this.autoPlayDelay);
    }

    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
    }
  }

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
            `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`
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
    
    const style = document.createElement('style');
    style.textContent = `
      .holographic-card::after {
        background: var(--radial-bg, radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%));
        opacity: var(--reflection-opacity, 0.5);
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

  // ===== INITIALIZE SLIDER =====
  document.addEventListener('DOMContentLoaded', function() {
    new ProjectSlider();
  });

})();


