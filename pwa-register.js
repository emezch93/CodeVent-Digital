/**
 * CodeVent Digital — pwa-register.js
 * Add before </body> on every page, including index.html.
 *
 * This file handles:
 *  - SW registration (checks for an existing registration first)
 *  - Update banner
 *  - Manual install trigger (Add to Home Screen) — NO auto popup.
 *    Wire any element with id="cv-install-btn" (e.g. in your sidebar)
 *    to trigger the native install prompt on click.
 */
(function () {
  'use strict';

  /* Only the canonical apex domain is allowed to register the SW or
     offer install. www.codeventdigital.site, the raw github.io pages
     link, localhost, or any other host are all separate origins as
     far as the browser is concerned — without this guard they'd each
     think the app isn't installed yet and re-offer it. */
  const CANONICAL_HOST = 'codeventdigital.site';
  if (location.hostname !== CANONICAL_HOST) return;

  if (!('serviceWorker' in navigator)) return;

  /* Only register if no SW is controlling this page yet —
     prevents the double-registration InvalidStateError */
  async function registerSW() {
    try {
      const existing = await navigator.serviceWorker.getRegistration('./');
      const reg = existing || await navigator.serviceWorker.register('sw.js', { scope: './' });

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) { refreshing = true; window.location.reload(); }
      });

      setInterval(() => reg.update(), 60_000);

    } catch (err) {
      console.warn('[PWA] SW error:', err);
    }
  }

  window.addEventListener('load', registerSW);

  /* ── Update Banner ── */
  function showUpdateBanner(newWorker) {
    if (document.getElementById('cv-update-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'cv-update-banner';
    banner.innerHTML =
      '<span>🚀 New version ready!</span>' +
      '<button id="cv-update-btn">Update Now</button>' +
      '<button id="cv-dismiss-btn">✕</button>';
    Object.assign(banner.style, {
      position:'fixed', bottom:'1.25rem', left:'50%',
      transform:'translateX(-50%)', background:'#5b4cff', color:'#fff',
      display:'flex', alignItems:'center', gap:'.75rem',
      padding:'.75rem 1.25rem', borderRadius:'.65rem',
      boxShadow:'0 4px 24px rgba(91,76,255,.45)',
      fontSize:'.88rem', fontFamily:'system-ui,sans-serif',
      zIndex:'99999', whiteSpace:'nowrap', maxWidth:'calc(100vw - 2.5rem)'
    });
    ['cv-update-btn','cv-dismiss-btn'].forEach(id => {
      Object.assign(banner.querySelector('#'+id).style, {
        background:'rgba(255,255,255,.2)', border:'none', color:'#fff',
        padding:'.4rem .85rem', borderRadius:'.4rem',
        cursor:'pointer', fontSize:'.85rem', fontWeight:'600'
      });
    });
    document.body.appendChild(banner);
    banner.querySelector('#cv-update-btn').onclick = () => newWorker.postMessage({ type: 'SKIP_WAITING' });
    banner.querySelector('#cv-dismiss-btn').onclick = () => banner.remove();
  }

  /* ── Manual Install (no auto popup) ──
     Chrome/Edge fire beforeinstallprompt once support is detected.
     We capture it silently and only prompt when the user clicks
     your own sidebar/nav "Install" element (id="cv-install-btn").
     The button is HIDDEN by default and only revealed once a real
     prompt is available — it's hidden again the instant the app is
     installed or is already running standalone, so it never lingers.

     Note on "separate browser": install state is per-browser, set
     by that browser's OS/profile — there is no web API that lets
     one browser know another browser already installed the app.
     Installing in Chrome will never be visible to Firefox or Edge.
     That's a browser platform limit, not something this script can
     fix — but this script does guarantee the button never shows in
     a browser where the app IS already installed, and never shows
     at all until that browser confirms installability. */
  let deferredPrompt = null;
  const installBtn = document.getElementById('cv-install-btn');

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true; // iOS Safari fallback
  }

  function hideInstallButton() {
    if (installBtn) installBtn.style.display = 'none';
  }

  function revealInstallButton() {
    if (installBtn) installBtn.style.display = '';
  }

  // Hide immediately on every load until we know there's something to offer
  hideInstallButton();

  if (!isStandalone()) {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();      // stop Chrome's mini-infobar too
      deferredPrompt = e;      // stash it
      revealInstallButton();   // only now does the button appear
    });
  }

  function wireInstallButton() {
    if (!installBtn || installBtn.dataset.cvWired) return;
    installBtn.dataset.cvWired = '1';
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') hideInstallButton();
    });
  }

  document.addEventListener('DOMContentLoaded', wireInstallButton);

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallButton();
  });

})();
