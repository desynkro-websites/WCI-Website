/* SAME-PAGE ANCHOR LINKS */
document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
    document.querySelector('.nav-links')?.classList.remove('open');
    document.querySelector('.hamburger')?.classList.remove('active');
    document.querySelector('.hamburger')?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelector('.hamburger')?.addEventListener('click', e => {
  const navLinks = document.querySelector('.nav-links');
  const hamburger = e.currentTarget;
  const isOpen = navLinks?.classList.toggle('open');
  hamburger?.classList.toggle('active');
  hamburger?.setAttribute('aria-expanded', !!isOpen);
});

/* LIGHTBOX */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCounter = document.querySelector('.lightbox-counter');
const lightboxCaption = document.querySelector('.lightbox-caption');

let currentIndex = 0;

function getGalleryImages() {
  return [...document.querySelectorAll('.gallery-item img')];
}

function openLightbox(index) {
  currentIndex = index;
  const allImgs = getGalleryImages();
  const img = allImgs[index];
  if (!img) return;
  lightboxImg.src = img.src;
  lightboxCaption.textContent = img.alt;
  lightboxCounter.textContent = `${index + 1} / ${allImgs.length}`;
  lightbox.classList.add('open');
}

window.prevImage = function () {
  const allImgs = getGalleryImages();
  currentIndex = (currentIndex - 1 + allImgs.length) % allImgs.length;
  openLightbox(currentIndex);
};

window.nextImage = function () {
  const allImgs = getGalleryImages();
  currentIndex = (currentIndex + 1) % allImgs.length;
  openLightbox(currentIndex);
};

document.querySelector('.gallery-grid')?.addEventListener('click', e => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  const img = item.querySelector('img');
  if (!img) return;
  const allImgs = getGalleryImages();
  const idx = allImgs.indexOf(img);
  if (idx > -1) openLightbox(idx);
});

function closeLightbox(e) {
  if (!e || e.target === lightbox || e.target.classList.contains('close')) {
    lightbox.classList.remove('open');
  }
}

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') lightbox.classList.remove('open');
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevImage(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); nextImage(); }
});

let touchStartX = 0;
lightboxImg.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

lightboxImg.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextImage();
    else prevImage();
  }
}, { passive: true });

/* TESTIMONIALS CAROUSEL */
const carouselGrid = document.querySelector('.testimonials-grid');
const cards = carouselGrid?.querySelectorAll('.testimonial-card');
let carouselCurrent = 0;
let carouselInterval;

function getCardsPerView() {
  return window.innerWidth < 768 ? 1 : 3;
}

if (carouselGrid && cards?.length) {
  let nav, dotsContainer, navPrev, navNext;
  let cachedGridGap = 0;

  function buildCarousel() {
    if (nav) nav.remove();

    cachedGridGap = parseFloat(getComputedStyle(carouselGrid).gap) || 0;

    nav = document.createElement('div');
    nav.className = 'carousel-nav';
    nav.innerHTML = '<button class="carousel-nav-btn prev" aria-label="Previous">&#8249;</button><div class="carousel-dots"></div><button class="carousel-nav-btn next" aria-label="Next">&#8250;</button>';
    carouselGrid.closest('.testimonials-carousel').after(nav);

    dotsContainer = nav.querySelector('.carousel-dots');
    navPrev = nav.querySelector('.prev');
    navNext = nav.querySelector('.next');

    const perView = getCardsPerView();
    const numPages = Math.ceil(cards.length / perView);

    for (let i = 0; i < numPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
      dotsContainer.appendChild(dot);
    }

    navPrev.addEventListener('click', () => { goTo(carouselCurrent - 1); startAutoplay(); });
    navNext.addEventListener('click', () => { goTo(carouselCurrent + 1); startAutoplay(); });
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === carouselCurrent));
  }

  function goTo(index) {
    const perView = getCardsPerView();
    const maxIndex = Math.ceil(cards.length / perView) - 1;
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;
    carouselCurrent = index;
    const container = carouselGrid.closest('.testimonials-carousel');
    const pageWidth = container.clientWidth + cachedGridGap;
    carouselGrid.style.transform = `translateX(-${carouselCurrent * pageWidth}px)`;
    updateDots();
  }

  function startAutoplay() { stopAutoplay(); carouselInterval = setInterval(() => goTo(carouselCurrent + 1), 15000); }
  function stopAutoplay() { clearInterval(carouselInterval); }

  buildCarousel();
  goTo(0);
  startAutoplay();

  let touchStartX = 0, touchStartY = 0;

  carouselGrid.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  carouselGrid.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) e.preventDefault();
  }, { passive: false });

  carouselGrid.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      goTo(carouselCurrent + (dx < 0 ? 1 : -1));
      startAutoplay();
    }
  }, { passive: true });
}

/* SERVICES CAROUSEL (MOBILE) */
function initServicesCarousel() {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  const oldNav = document.querySelector('.services-carousel-nav');
  if (oldNav) oldNav.remove();
  const oldWrap = grid.closest('.services-carousel');
  if (oldWrap) {
    oldWrap.parentNode.insertBefore(grid, oldWrap);
    oldWrap.remove();
  }
  grid.style.transform = '';
  grid.style.transition = '';

  if (window.innerWidth >= 540) return;

  const cards = grid.querySelectorAll('.service-card');
  if (cards.length < 2) return;

  const carousel = document.createElement('div');
  carousel.className = 'services-carousel';
  grid.parentNode.insertBefore(carousel, grid);
  carousel.appendChild(grid);

  let current = 0;
  let startX = 0, startY = 0;

  const nav = document.createElement('div');
  nav.className = 'services-carousel-nav carousel-nav';
  nav.innerHTML =
    '<button class="carousel-nav-btn prev" aria-label="Previous">&#8249;</button><div class="carousel-dots"></div><button class="carousel-nav-btn next" aria-label="Next">&#8250;</button>';
  carousel.after(nav);

  const dots = nav.querySelector('.carousel-dots');
  const navPrev = nav.querySelector('.prev');
  const navNext = nav.querySelector('.next');

  cards.forEach(() => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.addEventListener('click', () => goTo([...dots.children].indexOf(dot)));
    dots.appendChild(dot);
  });

  function goTo(index) {
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    current = index;
    grid.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  grid.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  grid.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) e.preventDefault();
  }, { passive: false });

  grid.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  navPrev.addEventListener('click', () => goTo(current - 1));
  navNext.addEventListener('click', () => goTo(current + 1));

  goTo(0);
}

initServicesCarousel();

/* GALLERY SHOW MORE (MOBILE) */
const galleryGrid = document.querySelector('.gallery-grid');

function initGallery() {
  if (!galleryGrid) return;

  const oldBtn = document.querySelector('.gallery-more-btn');
  const oldWrap = document.querySelector('.gallery-more-items');
  if (oldWrap) {
    while (oldWrap.firstChild) galleryGrid.appendChild(oldWrap.firstChild);
    oldWrap.remove();
  }
  if (oldBtn) oldBtn.remove();

  const items = galleryGrid.querySelectorAll('.gallery-item');

  if (window.innerWidth < 768 && items.length > 3) {
    const moreBtn = document.createElement('button');
    moreBtn.className = 'gallery-more-btn';
    moreBtn.textContent = 'View all photos';

    const moreWrap = document.createElement('div');
    moreWrap.className = 'gallery-more-items';

    for (let i = 3; i < items.length; i++) {
      moreWrap.appendChild(items[i]);
    }

    galleryGrid.after(moreBtn);
    moreBtn.after(moreWrap);

    moreBtn.addEventListener('click', function expand() {
      moreWrap.style.maxHeight = moreWrap.scrollHeight + 'px';
      moreWrap.style.opacity = '1';
      moreBtn.style.display = 'none';
    });
  }
}

initGallery();

/* DEBOUNCED RESIZE HANDLER */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (carouselGrid && cards?.length) {
      const prevIndex = carouselCurrent;
      buildCarousel();
      goTo(Math.min(prevIndex, Math.ceil(cards.length / getCardsPerView()) - 1));
      startAutoplay();
    }
    initServicesCarousel();
    initGallery();
  }, 150);
});

/* SECTION REVEAL ANIMATION */
(function () {
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(s => s.classList.add('section-hidden'));

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('section-hidden');
        entry.target.classList.add('section-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '-100px 0px' });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* GALLERY OVERLAY LABELS */
document.querySelectorAll('.gallery-item img').forEach(img => {
  const item = img.closest('.gallery-item');
  if (item && img.alt) item.dataset.label = img.alt;
});

/* COUNTER ANIMATION */
(function () {
  const stats = document.querySelector('.about-stats');
  if (!stats) return;

  const numbers = stats.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);

      numbers.forEach(el => {
        const text = el.textContent.trim();
        const num = parseInt(text, 10);
        if (isNaN(num)) return;
        const suffix = text.replace(num, '');
          el.textContent = '0' + suffix;
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const progress = 1 - (1 - t) * (1 - t) * (1 - t);
          if (suffix.includes('★')) {
            const val = (progress * num).toFixed(1);
            el.textContent = (val.endsWith('.0') ? val.slice(0, -2) : val) + suffix;
          } else {
            el.textContent = Math.floor(progress * num) + suffix;
          }
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    });
  }, { threshold: 0.5 });

  counterObserver.observe(stats);
})();

/* SMS BUTTON SHOW/HIDE */
(function () {
  const btn = document.querySelector('.sms-btn');
  if (!btn) return;

  const contact = document.getElementById('contact');

  function toggle() {
    const scrollY = window.scrollY;
    const contactVisible = contact &&
      contact.getBoundingClientRect().top < window.innerHeight;

    if (scrollY > 200 && !contactVisible) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

/* FAQ ACCORDION */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      i.querySelector('.faq-answer')?.setAttribute('aria-hidden', 'true');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      item.querySelector('.faq-answer')?.setAttribute('aria-hidden', 'false');
    }
  });
});
