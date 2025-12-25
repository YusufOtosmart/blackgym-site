document.addEventListener("DOMContentLoaded", () => {
  /* HEADER SCROLL SHADOW */
  const header = document.querySelector(".site-header");

  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  /* MOBILE NAV TOGGLE */
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Linke tıklayınca menüyü kapat (mobilde)
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768 && nav.classList.contains("open")) {
          nav.classList.remove("open");
          navToggle.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* REVEAL ANİMASYONLARI */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => obs.observe(el));
  } else {
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
      const offset = -currentIndex * 100;
      track.style.transform = `translateX(${offset}%)`;
    };

    const goPrev = () => {
      if (!slides.length) return;
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    };

    const goNext = () => {
      if (!slides.length) return;
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    };

    prevBtn && prevBtn.addEventListener("click", goPrev);
    nextBtn && nextBtn.addEventListener("click", goNext);

    // Basit touch swipe (mobil için)
    let startX = 0;
    let isSwiping = false;

    if (track) {
      track.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
      });

      track.addEventListener("touchmove", (e) => {
        if (!isSwiping) return;
        const diff = e.touches[0].clientX - startX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            goPrev();
          } else {
            goNext();
          }
          isSwiping = false;
        }
      });

      track.addEventListener("touchend", () => {
        isSwiping = false;
      });
    }
  }

  /* LIGHTBOX (Alanlarımız görselleri) */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-image");
  const lbCaption = document.getElementById("lightbox-caption");
  const lbClose = document.querySelector(".lightbox-close");

  if (lightbox && lbImg && lbCaption && lbClose) {
    const openLightbox = (src, altText) => {
      lbImg.src = src;
      lbImg.alt = altText || "";
      lbCaption.textContent = altText || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    document.querySelectorAll(".facility-slide img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        openLightbox(img.src, img.alt);
      });
    });

    lbClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* FOOTER YILI OTOMATİK */
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
/* ==========================================
   REVIEWS CAROUSEL JAVASCRIPT
   
   ========================================== */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initReviewsCarousel();
  });

  function initReviewsCarousel() {
    const carousel = document.querySelector('.reviews-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.review-slider-track');
    const slides = Array.from(track.querySelectorAll('.review-slide'));
    const prevBtn = carousel.querySelector('.review-slider-btn.prev');
    const nextBtn = carousel.querySelector('.review-slider-btn.next');
    const dotsContainer = document.querySelector('.review-dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    // Create dots
    slides.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('review-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.review-dot'));

    // Update carousel position
    function updateCarousel(animate = true) {
      const offset = -currentIndex * 100;
      if (animate) {
        track.style.transition = 'transform 0.4s ease-out';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = `translateX(${offset}%)`;

      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      // Update button states
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    // Go to specific slide
    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      updateCarousel();
    }

    // Previous slide
    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }

    // Next slide
    function nextSlide() {
      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateCarousel();
      }
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Keyboard navigation
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next slide
          nextSlide();
        } else {
          // Swipe right - previous slide
          prevSlide();
        }
      }
    }

    // Auto-play (optional - uncomment to enable)
    /*
    let autoplayInterval;
    const autoplayDelay = 5000; // 5 seconds

    function startAutoplay() {
      autoplayInterval = setInterval(() => {
        if (currentIndex < totalSlides - 1) {
          nextSlide();
        } else {
          currentIndex = 0;
          updateCarousel();
        }
      }, autoplayDelay);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Start autoplay
    startAutoplay();
    */

    // Initial setup
    updateCarousel(false);
  }

})();
