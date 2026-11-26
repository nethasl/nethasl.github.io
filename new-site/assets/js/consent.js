/* NSL Psychology — cookie choice and Google Analytics (loaded only with consent)
   To switch analytics on, put the GA4 measurement ID (starts with "G-") in the
   data-ga-id attribute of the <script> tag that loads this file, on every page.
   While the attribute is empty, no banner is shown and nothing is sent to Google. */
(function () {
  'use strict';

  var me = document.currentScript;
  var GA_ID = me ? (me.getAttribute('data-ga-id') || '').trim() : '';
  var KEY = 'nsl-analytics-consent'; // 'granted' or 'denied'

  var banner = document.getElementById('cookie-banner');
  var settingsLinks = document.querySelectorAll('[data-cookie-settings]');

  // No analytics configured: hide the cookie settings link and stop here
  if (!/^G-[A-Z0-9]+$/.test(GA_ID)) {
    settingsLinks.forEach(function (el) { el.hidden = true; });
    return;
  }

  function getChoice() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function saveChoice(value) {
    try { window.localStorage.setItem(KEY, value); } catch (e) { /* private browsing: choice lasts this visit */ }
  }

  var loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  // Stop analytics and remove its cookies if consent is withdrawn
  function stopAnalytics() {
    window['ga-disable-' + GA_ID] = true;
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name === '_gat') {
        ['', host, '.' + host, location.hostname].forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
        });
      }
    });
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
  }
  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
  }

  if (banner) {
    banner.querySelector('[data-consent="accept"]').addEventListener('click', function () {
      saveChoice('granted'); hideBanner(); loadAnalytics();
    });
    banner.querySelector('[data-consent="reject"]').addEventListener('click', function () {
      saveChoice('denied'); hideBanner(); stopAnalytics();
    });
  }
  settingsLinks.forEach(function (el) {
    el.hidden = false;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner();
      var first = banner && banner.querySelector('button');
      if (first) first.focus();
    });
  });

  var choice = getChoice();
  if (choice === 'granted') loadAnalytics();
  else if (choice !== 'denied') showBanner();
})();
