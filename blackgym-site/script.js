/* ====================================================================================
   BLACK GYM - MAIN JAVASCRIPT
   Handles: UI Animations, Sliders, and Interactions
   ==================================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================
     TEXT ROTATOR LOGIC
     ========================================== */
  function initTextRotator() {
    const el = document.querySelector('.hero-title-dynamic');
    if (!el) return;

    // Check language from html tag
    const lang = document.documentElement.lang;

    const words = lang === 'tr' 
      ? ['GÜÇLÜ HİSSET', 'BUGÜN BAŞLA', 'BAHANE YOK'] 
      : ['FEEL STRONG', 'START TODAY', 'NO EXCUSES'];
    
    let i = 0;
    el.textContent = words[0]; 
    el.classList.remove('hidden');

    setInterval(() => {
      el.classList.add('hidden');
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove('hidden');
      }, 900);
    }, 4000);
  }
  
  // Start rotator
  initTextRotator();

  /* ====================================================================================
     ORIGINAL FEATURES (Preserved)
     ==================================================================================== */

  /* HEADER SCROLL SHADOW */
  const header = document.querySelector(".site-header");
  const handleScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* MOBILE NAVIGATION */
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (navToggle && nav) {
    navToggle.addEventListener("click", (e) => {
      e.preventDefault(); // Stop jump
      const isOpen = nav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          nav.classList.remove("open");
          navToggle.classList.remove("open");
        }
      });
    });
  }

  /* REVEAL ANIMATIONS (IntersectionObserver) */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => obs.observe(el));
  } else {
    // Fallback for older browsers
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* FACILITIES SLIDER */
  const slider = document.querySelector(".facilities-slider");
  if (slider) {
    const track = slider.querySelector(".slider-track");
    const slides = slider.querySelectorAll(".facility-slide");
    const prevBtn = slider.querySelector(".slider-btn.prev");
    const nextBtn = slider.querySelector(".slider-btn.next");
    let currentIndex = 0;

    const updateSlider = () => {
      if (!track) return;
      track.style.transform = `translateX(${-currentIndex * 100}%)`;
    };

    if (prevBtn) prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    });

    if (nextBtn) nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    });

    // Touch support
    let startX = 0;
    track.addEventListener("touchstart", (e) => startX = e.touches[0].clientX, { passive: true });
    track.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? prevBtn.click() : nextBtn.click();
      }
    });
  }

  /* LIGHTBOX */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-image");
  const lbCaption = document.getElementById("lightbox-caption");
  const lbClose = document.querySelector(".lightbox-close");

  if (lightbox && lbImg) {
    document.querySelectorAll(".facility-slide img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        if(lbCaption) lbCaption.textContent = img.alt;
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    if(lbClose) lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  }

  /* DYNAMIC YEAR */
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  
  /* ANALYTICS TRACKING */
  document.querySelectorAll('[data-track]').forEach(function(el) {
    el.addEventListener('click', function() {
      var event = this.getAttribute('data-track');
      if (typeof gtag !== 'undefined') {
        gtag('event', event, {'event_category': 'interaction'});
      }
    });
  });
});