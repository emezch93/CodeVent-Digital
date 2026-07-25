/**
 * CodeVent Digital — pwa-register.js
 * Add before </body> on every page, including index.html.
 *
 * This file handles:
 *  - SW registration (checks for an existing registration first)
 *  - Update banner
 *  - Install badge (Add to Home Screen)
 */
(function () {
  'use strict';

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

  /* ── Install Badge ── */
  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true; // iOS Safari fallback
  }

  // If already running as an installed app, never show the badge —
  // and don't bother listening for beforeinstallprompt at all.
  if (!isStandalone()) {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallBadge();
    });
  }

  function showInstallBadge() {
    if (document.getElementById('cv-install-badge')) return;
    if (isStandalone()) return; // defensive: never show once installed
    //const badge = document.createElement('button');
    badge.id = 'cv-install-badge';
    badge.textContent = '⬇ Install App';
    Object.assign(badge.style, {
      position:'fixed', bottom:'1.25rem', right:'1.25rem',
      background:'#00e5a0', color:'#0d0f1a', border:'none',
      padding:'.65rem 1.2rem', borderRadius:'99px', fontWeight:'700',
      fontSize:'.85rem', fontFamily:'system-ui,sans-serif',
      cursor:'pointer', boxShadow:'0 4px 18px rgba(0,229,160,.35)',
      zIndex:'99998', transition:'opacity .2s'
    });
    badge.onmouseenter = () => badge.style.opacity = '.85';
    badge.onmouseleave = () => badge.style.opacity = '1';
    badge.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') badge.remove();
      deferredPrompt = null;
    };
    document.body.appendChild(badge);
  }

  window.addEventListener('appinstalled', () => {
    const b = document.getElementById('cv-install-badge');
    if (b) b.remove();
    deferredPrompt = null;
  });

  /* Re-check on visibility change too — covers the case where a user
     installs the app in another tab/window, or launches the installed
     app while this tab is still open in the browser. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isStandalone()) {
      const b = document.getElementById('cv-install-badge');
      if (b) b.remove();
    }
  });

})();
