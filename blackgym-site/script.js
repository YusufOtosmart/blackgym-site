/* ====================================================================================
   BLACK GYM - MAIN JAVASCRIPT
   
   Designer: Yusuf - Otosmart Bilgi Teknolojileri A.Ş.
   Contact: info@otosmart.com.tr
   
   Features:
   1. Header scroll effects
   2. Mobile navigation
   3. Reveal animations
   4. Facilities carousel  
   5. Lightbox
   6. Footer year
   
   Note: Hero title animation is handled inline in HTML for better compatibility
   ==================================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ====================================================================================
     1. HEADER SCROLL SHADOW
     Adds shadow to header when scrolling down
     ==================================================================================== */
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

  /* ====================================================================================
     2. MOBILE NAVIGATION
     Hamburger menu toggle for mobile devices
     ==================================================================================== */
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

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

  /* ====================================================================================
     3. REVEAL ANIMATIONS
     Fade-in effect when elements scroll into view
     ==================================================================================== */
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

  /* ====================================================================================
     4. FACILITIES SLIDER
     Carousel for gym areas
     ==================================================================================== */
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

    // Touch swipe support
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

  /* ====================================================================================
     5. LIGHTBOX
     Image popup viewer for facility images
     ==================================================================================== */
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

  /* ====================================================================================
     6. FOOTER YEAR AUTO-UPDATE
     Automatically updates copyright year
     ==================================================================================== */
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

});

/* ====================================================================================
   END OF JAVASCRIPT
   
   Total features: 6
   Hero animation: Handled inline in HTML
   Browser support: Modern browsers with graceful fallbacks
   ==================================================================================== */