// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    navToggle.classList.toggle("open");
  });

  // Close menu when a link is clicked (mobile UX)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.classList.remove("open");
    });
  });
}

// Dynamic year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Header shadow on scroll
const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  if (!header) return;
  if (window.scrollY > 10) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Reveal on scroll
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback: show all
  revealElements.forEach((el) => el.classList.add("visible"));
}

/* ---------- FACILITIES SLIDER ---------- */

const sliderTrack = document.querySelector(".slider-track");
const sliderSlides = document.querySelectorAll(".facility-slide");
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");

let currentSlideIndex = 0;

function goToSlide(index) {
  if (!sliderTrack || !sliderSlides.length) return;
  const maxIndex = sliderSlides.length - 1;
  if (index < 0) index = maxIndex;
  if (index > maxIndex) index = 0;
  currentSlideIndex = index;
  sliderTrack.style.transform = `translateX(${index * -100}%)`;
}

if (sliderTrack && sliderSlides.length) {
  goToSlide(0);

  prevBtn?.addEventListener("click", () => goToSlide(currentSlideIndex - 1));
  nextBtn?.addEventListener("click", () => goToSlide(currentSlideIndex + 1));
}

/* ---------- LIGHTBOX FOR FACILITIES ---------- */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const facilityImages = document.querySelectorAll(".facility-slide img");

function openLightbox(img) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || "";

  const titleEl = img.closest(".card")?.querySelector("h3");
  if (lightboxCaption && titleEl) {
    lightboxCaption.textContent = titleEl.textContent;
  } else if (lightboxCaption) {
    lightboxCaption.textContent = "";
  }

  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

facilityImages.forEach((img) => {
  img.style.cursor = "zoom-in";
  img.addEventListener("click", () => openLightbox(img));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});
