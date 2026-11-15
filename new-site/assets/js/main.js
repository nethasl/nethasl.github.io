/* NSL Psychology — menu, active section highlighting and scroll reveal */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  var toggle = document.querySelector('.menu-toggle');
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));

  /* ---- Mobile / tablet menu ---- */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  links.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });

  /* ---- Header shadow once the page scrolls ---- */
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Highlight the menu item for the section in view ---- */
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function setActive() {
    var line = header.offsetHeight + window.innerHeight * 0.3;
    var current = null;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s.id; });
    // At the very bottom of the page, the last section is the active one
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { setActive(); ticking = false; }); }
  }, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();

  /* ---- Reveal content as it scrolls into view ---- */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    // Stagger items that sit together in a group
    document.querySelectorAll('.reveal-group').forEach(function (group) {
      group.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = Math.min(i * 80, 400) + 'ms'; });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Clouds behind the welcome section fade away on scroll ---- */
  var hero = document.querySelector('.hero');
  var heroBg = document.querySelector('.hero-bg');
  if (hero && heroBg) {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    var fading = false;
    var fadeClouds = function () {
      fading = false;
      var p = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.85), 0), 1);
      heroBg.style.opacity = String(1 - p);
      // gentle drift upwards unless the visitor prefers less motion
      heroBg.style.transform = calm.matches ? '' : 'translateY(' + (p * -40) + 'px) scale(' + (1 + p * 0.06) + ')';
    };
    window.addEventListener('scroll', function () {
      if (!fading) { fading = true; requestAnimationFrame(fadeClouds); }
    }, { passive: true });
    window.addEventListener('resize', fadeClouds);
    fadeClouds();
  }

  /* ---- Footer year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
