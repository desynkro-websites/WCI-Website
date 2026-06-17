# Changelog

## 1.1.1 — 2026-06-17

- Restructured README for Codeberg with screenshots and file tree
- Replaced all em dashes with punctuation
- Fixed mobile scroll bug: services carousel and gallery no longer reset when address bar hides/shows
- Adaptive gallery: shows 3 images on phone, 4 on tablet, all on desktop
- Added HOSTING.md as hosting reference guide (replaced old README)
- Added CHANGELOG.md
- Optimized thumbnail (png to jpg, 386KB to 109KB)
- Added .gitignore and MIT LICENSE
- All same-page anchor links use smooth scroll without URL hash fragments
- Nav dropdown blur restored (moved ul outside nav)

## 1.1.0 — Major restructure

- Split single-file index.html into separate css/style.css and js/main.js
- Added FAQ accordion section (5 questions) between Testimonials and Contact
- Added testimonial carousel with autoplay, arrow navigation, and dot indicators
- Added services carousel with arrow navigation
- Added gallery lightbox with prev/next navigation and counter
- Added adaptive "View all photos" button
- Added Local Guide badges on 3 testimonials
- Added 6-star rating easter egg for Monty testimonial
- Added skip-to-content link for accessibility
- Added ARIA attributes (aria-expanded, aria-hidden, aria-controls) on FAQ and nav
- Added prefers-reduced-motion support for accessibility
- Added SEO metadata (structured data, Open Graph, Twitter cards)
- Nav hamburger toggle migrated from inline onclick to addEventListener
- Enlarged star ratings to 22px with letter-spacing and glow
- Debounced resize handler prevents layout thrashing
- Lightbox uses event delegation and fresh DOM queries
- Testimonial carousel gap cached instead of queried on every navigation
- Carousel index preserved across window resize
- CSS: box-sizing border-box on testimonial cards
- CSS: focus-visible outlines, webkit-backdrop-filter, prefers-reduced-motion
- Removed dead CSS selectors and redundant smooth-scroll JS
- Docker support with docker-compose.yml for easy deployment

## 1.0.0 — Initial version

- Single-file website (all HTML, CSS, JS in one index.html)
