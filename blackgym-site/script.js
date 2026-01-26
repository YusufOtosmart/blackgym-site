/* ====================================================================================
   BLACK GYM - MAIN JAVASCRIPT (UPDATED)

   Designer: Yusuf - Otosmart Bilgi Teknolojileri A.Ş.
   Contact: info@otosmart.com.tr

   Features:
   1. Header scroll effects
   2. Mobile navigation (ARIA + outside click + ESC + resize)
   3. Reveal animations
   4. Facilities carousel
   5. Lightbox (focus-friendly)
   6. Footer year

   ==================================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ====================================================================================
     1. HEADER SCROLL SHADOW
     ==================================================================================== */
  const header = document.querySelector(".site-header");

  const handleScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ====================================================================================
     2. MOBILE NAVIGATION (ACCESSIBLE)
     ==================================================================================== */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-links a");

  // Prefer aria-controls to find the correct nav
  const navId = navToggle?.getAttribute("aria-controls");
  const nav = navId ? document.getElementById(navId) : document.querySelector(".nav");

  const setMenuState = (open) => {
    if (!navToggle || !nav) return;

    nav.classList.toggle("open", open);
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");

    // Optional: lock scroll when menu open (helps on mobile)
    document.body.style.overflow = open ? "hidden" : "";
  };

  const isMenuOpen = () => nav?.classList.contains("open");

  if (navToggle && nav) {
    // Ensure initial ARIA state is consistent
    navToggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");

    navToggle.addEventListener("click", (e) => {
      e.preventDefault();
      setMenuState(!isMenuOpen());
    });

    // Close when clicking a link (mobile)
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768 && isMenuOpen()) setMenuState(false);
      });
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;
      const target = e.target;
      const clickedInside = nav.contains(target) || navToggle.contains(target);
      if (!clickedInside) setMenuState(false);
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) setMenuState(false);
    });

    // Close when resizing to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && isMenuOpen()) setMenuState(false);
    });
  }

  /* ====================================================================================
     3. REVEAL ANIMATIONS
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
      track.style.transform = `translateX(${-currentIndex * 100}%)`;
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
      }, { passive: true });

      track.addEventListener("touchmove", (e) => {
        if (!isSwiping) return;
        const diff = e.touches[0].clientX - startX;

        if (Math.abs(diff) > 50) {
          diff > 0 ? goPrev() : goNext();
          isSwiping = false;
        }
      }, { passive: true });

      track.addEventListener("touchend", () => {
        isSwiping = false;
      });
    }
  }

  /* ====================================================================================
     5. LIGHTBOX (FOCUS FRIENDLY)
     ==================================================================================== */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-image");
  const lbCaption = document.getElementById("lightbox-caption");
  const lbClose = document.querySelector(".lightbox-close");

  let lastFocusEl = null;

  if (lightbox && lbImg && lbCaption && lbClose) {
    const openLightbox = (src, altText) => {
      lastFocusEl = document.activeElement;

      lbImg.src = src;
      lbImg.alt = altText || "";
      lbCaption.textContent = altText || "";

      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      // move focus to close for accessibility
      lbClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      // restore focus
      if (lastFocusEl && typeof lastFocusEl.focus === "function") {
        lastFocusEl.focus();
      }
    };

    document.querySelectorAll(".facility-slide img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openLightbox(img.src, img.alt));
    });

    lbClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });
  }

  /* ====================================================================================
     6. FOOTER YEAR AUTO-UPDATE
     ==================================================================================== */
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

});
