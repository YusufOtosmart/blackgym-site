/* ==========================================
   BLACK GYM - MAIN JAVASCRIPT
   
   Designer: Yusuf - Otosmart Bilgi Teknolojileri A.Ş.
   Contact: info@otosmart.com.tr
   
   Structure:
   1. Header scroll effects
   2. Mobile navigation
   3. Reveal animations (scroll effects)
   4. Facilities carousel
   5. Reviews carousel (DYNAMIC)
   6. Hero title animation (EXACT TEST CODE - iOS optimized)
   7. Lightbox (image popups)
   8. Footer year auto-update
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================
     1. HEADER SCROLL SHADOW
     Adds shadow to header when scrolling down
     ========================================== */
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
  handleScroll(); // Run on page load

  /* ==========================================
     2. MOBILE NAVIGATION
     Hamburger menu toggle for mobile devices
     ========================================== */
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (navToggle && nav) {
    // Toggle menu when hamburger clicked
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when link clicked (mobile only)
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

  /* ==========================================
     3. REVEAL ANIMATIONS
     Fade-in effect when elements scroll into view
     Uses Intersection Observer API for performance
     ========================================== */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      { threshold: 0.15 } // Trigger when 15% visible
    );

    revealEls.forEach((el) => obs.observe(el));
  } else {
    // Fallback for older browsers
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ==========================================
     4. FACILITIES SLIDER
     Carousel for gym areas (Weight, Track, Studio, etc.)
     ========================================== */
  const slider = document.querySelector(".facilities-slider");
  
  if (slider) {
    const track = slider.querySelector(".slider-track");
    const slides = slider.querySelectorAll(".facility-slide");
    const prevBtn = slider.querySelector(".slider-btn.prev");
    const nextBtn = slider.querySelector(".slider-btn.next");

    let currentIndex = 0;

    // Update slider position
    const updateSlider = () => {
      if (!track) return;
      const offset = -currentIndex * 100;
      track.style.transform = `translateX(${offset}%)`;
    };

    // Go to previous slide
    const goPrev = () => {
      if (!slides.length) return;
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    };

    // Go to next slide
    const goNext = () => {
      if (!slides.length) return;
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    };

    // Button event listeners
    prevBtn && prevBtn.addEventListener("click", goPrev);
    nextBtn && nextBtn.addEventListener("click", goNext);

    // Touch swipe support for mobile
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
        
        // Swipe threshold: 50px
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            goPrev(); // Swipe right
          } else {
            goNext(); // Swipe left
          }
          isSwiping = false;
        }
      });

      track.addEventListener("touchend", () => {
        isSwiping = false;
      });
    }
  }

  /* ==========================================
     5. REVIEWS CAROUSEL - DYNAMIC VERSION
     
     IMPORTANT: This carousel is DYNAMIC!
     Slides are built automatically from the reviewImages array below.
     
     TO ADD MORE REVIEWS:
     1. Take screenshot of Google review
     2. Save as review-6.png (or next number)
     3. Upload to img/reviews/ folder
     4. Add filename to reviewImages array below
     
     Example:
     const reviewImages = [
       'review-1.png',
       'review-2.png',
       'review-3.png',
       'review-4.png',
       'review-5.png',
       'review-6.png'  // ← Just add this!
     ];
     
     The carousel will automatically show all images!
     ========================================== */

  /* ==========================================
     CONFIGURATION - Your review image filenames
     Edit this array to add/remove/reorder reviews
     ========================================== */
  const reviewImages = [
    'review-1.png',
    'review-2.png',
    'review-3.png',
    'review-4.png',
    'review-5.png'
  ];

  const reviewImagesPath = 'img/reviews/'; // Folder path
  /* ========================================== */

  /**
   * Build carousel slides from the reviewImages array
   * This runs automatically when page loads
   */
  function buildReviewSlides() {
    const track = document.getElementById('review-slider-track');
    if (!track) {
      console.warn('⚠️ Review slider track not found');
      return;
    }

    // Clear any existing content
    track.innerHTML = '';

    // Build a slide for each image in the array
    reviewImages.forEach((filename, index) => {
      const slide = document.createElement('div');
      slide.classList.add('review-slide');
      
      const img = document.createElement('img');
      img.src = reviewImagesPath + filename;
      img.alt = `Google Maps yorumu ${index + 1}`;
      img.loading = 'lazy'; // Lazy load for performance
      
      slide.appendChild(img);
      track.appendChild(slide);
    });

    console.log(`✅ Built ${reviewImages.length} review slides`);
  }

  /**
   * Initialize the reviews carousel
   * Sets up navigation, dots, swipe, keyboard controls
   */
  function initReviewsCarousel() {
    const carousel = document.querySelector('.reviews-carousel');
    if (!carousel) {
      console.warn('⚠️ Reviews carousel not found');
      return;
    }

    const track = carousel.querySelector('.review-slider-track');
    const slides = Array.from(track.querySelectorAll('.review-slide'));
    const prevBtn = carousel.querySelector('.review-slider-btn.prev');
    const nextBtn = carousel.querySelector('.review-slider-btn.next');
    const dotsContainer = document.querySelector('.review-dots');

    if (!track || slides.length === 0) {
      console.warn('⚠️ No review slides found');
      return;
    }

    let currentIndex = 0;
    const totalSlides = slides.length;

    // Create dots indicator
    dotsContainer.innerHTML = ''; // Clear existing dots
    slides.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('review-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.review-dot'));

    /**
     * Update carousel position and UI
     * @param {boolean} animate - Whether to animate the transition
     */
    function updateCarousel(animate = true) {
      const offset = -currentIndex * 100;
      
      // Apply transition
      if (animate) {
        track.style.transition = 'transform 0.4s ease-out';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = `translateX(${offset}%)`;

      // Update active dot
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      // Update button states (disable at ends)
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    /**
     * Go to specific slide
     * @param {number} index - Slide index to go to
     */
    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      updateCarousel();
    }

    /**
     * Go to previous slide
     */
    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
        
        // Track in Google Analytics if available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'review_carousel_prev', {
            'event_category': 'engagement',
            'event_label': 'slide_' + (currentIndex + 1)
          });
        }
      }
    }

    /**
     * Go to next slide
     */
    function nextSlide() {
      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateCarousel();
        
        // Track in Google Analytics if available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'review_carousel_next', {
            'event_category': 'engagement',
            'event_label': 'slide_' + (currentIndex + 1)
          });
        }
      }
    }

    // Button event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Keyboard navigation (arrow keys)
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    /**
     * Handle swipe gesture
     */
    function handleSwipe() {
      const swipeThreshold = 50; // Minimum swipe distance
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide(); // Swipe left → next
        } else {
          prevSlide(); // Swipe right → previous
        }
      }
    }

    /* ==========================================
       AUTOPLAY (OPTIONAL)
       
       Uncomment this section to enable autoplay.
       Carousel will automatically advance every 5 seconds.
       Pauses on hover (desktop) and touch (mobile).
       ========================================== */
    /*
    let autoplayInterval;
    const autoplayDelay = 5000; // 5 seconds

    function startAutoplay() {
      // Clear any existing interval first
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
      
      autoplayInterval = setInterval(() => {
        if (currentIndex < totalSlides - 1) {
          nextSlide();
        } else {
          // Loop back to first slide
          currentIndex = 0;
          updateCarousel();
        }
      }, autoplayDelay);
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    // Pause on hover (desktop)
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Pause on touch (mobile)
    let touchPauseTimeout;
    carousel.addEventListener('touchstart', function() {
      stopAutoplay();
      clearTimeout(touchPauseTimeout);
    });

    carousel.addEventListener('touchend', function() {
      // Resume after 3 seconds
      touchPauseTimeout = setTimeout(startAutoplay, 3000);
    });

    // Pause when clicking arrows (resume after 5 seconds)
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        stopAutoplay();
        setTimeout(startAutoplay, 5000);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        stopAutoplay();
        setTimeout(startAutoplay, 5000);
      });
    }

    // Start autoplay
    startAutoplay();
    console.log('✅ Autoplay enabled (5 second intervals)');
    */

    // Initial setup (no animation on page load)
    updateCarousel(false);
    
    console.log(`✅ Reviews carousel initialized with ${totalSlides} slides`);
  }

  // Build slides first, then initialize carousel
  buildReviewSlides();
  initReviewsCarousel();

  /* ==========================================
     6. HERO TITLE ANIMATION - EXACT TEST CODE
     
     This uses the EXACT same code as ios-animation-test.html
     (Test 2) which works smoothly on iOS!
     
     Cycles through different action phrases with smooth
     fade transitions using simple class toggle.
     
     HOW IT WORKS (same as test):
     1. Add .hidden class → fade out (opacity 0)
     2. Wait 900ms for fade to complete
     3. Change text content
     4. Remove .hidden class → fade in (opacity 1)
     5. Repeat every 3 seconds
     
     WHY THIS WORKS ON iOS:
     - Simple class toggle (no RAF complexity)
     - Only opacity transition (no transforms)
     - Direct setTimeout (no complex timing)
     - Proven to work (test file works!)
     ========================================== */
  
  (function() {
    const dynamicTitle = document.querySelector('.hero-title-dynamic');
    
    if (!dynamicTitle) {
      console.warn('⚠️ Hero title element not found');
      return;
    }

    // Phrases to cycle through
    const words = [
      'GÜÇLÜ HİSSET',
      'BUGÜN BAŞLA'
    ];
    
    let currentIndex = 0;

    // Set initial text
    dynamicTitle.textContent = words[currentIndex];

    /**
     * Change to next phrase - EXACT test file code
     */
    function changeWord() {
      // Add 'hidden' class to fade out
      dynamicTitle.classList.add('hidden');
      
      // Wait for fade out to complete (900ms matches CSS transition)
      setTimeout(function() {
        // Change to next word
        currentIndex = (currentIndex + 1) % words.length;
        dynamicTitle.textContent = words[currentIndex];
        
        // Remove 'hidden' class to fade in
        dynamicTitle.classList.remove('hidden');
      }, 900);
    }

    // Change word every 3 seconds
    setInterval(changeWord, 3000);

    console.log('✅ Hero animation started (exact test code)');
    console.log(`📝 Cycling through ${words.length} phrases:`, words.join(', '));
  })();

  /* ==========================================
     7. LIGHTBOX
     Image popup viewer for facility images
     Click any facility image to view full-screen
     ========================================== */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-image");
  const lbCaption = document.getElementById("lightbox-caption");
  const lbClose = document.querySelector(".lightbox-close");

  if (lightbox && lbImg && lbCaption && lbClose) {
    /**
     * Open lightbox with image
     * @param {string} src - Image source URL
     * @param {string} altText - Image alt text / caption
     */
    const openLightbox = (src, altText) => {
      lbImg.src = src;
      lbImg.alt = altText || "";
      lbCaption.textContent = altText || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // Prevent scrolling
    };

    /**
     * Close lightbox
     */
    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = ""; // Restore scrolling
    };

    // Make all facility images clickable
    document.querySelectorAll(".facility-slide img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        openLightbox(img.src, img.alt);
      });
    });

    // Close button
    lbClose.addEventListener("click", closeLightbox);

    // Close when clicking outside image
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Close with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ==========================================
     8. FOOTER YEAR AUTO-UPDATE
     Automatically updates copyright year
     ========================================== */
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

}); // End DOMContentLoaded

/* ==========================================
   END OF MAIN JAVASCRIPT
   
   Total functions: 8
   Hero title: Using EXACT test code (proven on iOS)
   Browser support: Modern browsers + graceful fallbacks
   ========================================== */