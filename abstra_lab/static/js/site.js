document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-site-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastFocusedBeforeNav = null;

  const navFocusable = () => {
    if (!nav) return [];
    return [...nav.querySelectorAll('a[href]')];
  };

  const isNavOpen = () => nav && !nav.hasAttribute('hidden');

  const setNavOpen = (open) => {
    if (!navToggle || !nav) return;

    if (open) {
      lastFocusedBeforeNav = document.activeElement;
      nav.removeAttribute('hidden');
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close navigation');
      requestAnimationFrame(() => navFocusable()[0]?.focus());
      return;
    }

    nav.setAttribute('hidden', '');
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    if (lastFocusedBeforeNav && typeof lastFocusedBeforeNav.focus === 'function') {
      lastFocusedBeforeNav.focus();
    } else {
      navToggle.focus();
    }
  };

  if (navToggle) {
    navToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setNavOpen(!isNavOpen());
    });
  }

  if (nav) {
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setNavOpen(false));
    });

    nav.addEventListener('keydown', (event) => {
      if (!isNavOpen()) return;

      const items = navFocusable();
      if (!items.length) return;

      const index = items.indexOf(document.activeElement);

      if (event.key === 'Tab') {
        event.preventDefault();
        const next = event.shiftKey
          ? items[(index - 1 + items.length) % items.length]
          : items[(index + 1) % items.length];
        next.focus();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isNavOpen()) setNavOpen(false);
  });

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!prefersReducedMotion) {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach((el) => observer.observe(el));
    }
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  document.querySelectorAll('[data-file-upload]').forEach((wrapper) => {
    const input = wrapper.querySelector('[data-file-input], .file-upload__input, input[type="file"]');
    const nameEl = wrapper.querySelector('[data-file-name]');
    if (!input || !nameEl) return;

    const defaultLabel = nameEl.textContent.trim() || 'No file chosen';

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      nameEl.textContent = file ? file.name : defaultLabel;
    });
  });

  const rows = document.querySelector('[data-telemetry-rows]');
  const kpis = document.querySelector('[data-telemetry-kpis]');
  if (!rows || !kpis) return;

  const format = (value, digits = 2) => {
    if (value === null || value === undefined || value === '') return '--';
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return number.toFixed(digits);
  };

  const renderFrames = (frames) => {
    if (!frames.length) return;
    const latest = frames[0];
    kpis.querySelector('[data-field="altitude_m"]').textContent = format(latest.altitude_m, 1);
    kpis.querySelector('[data-field="velocity_mps"]').textContent = format(latest.velocity_mps, 1);
    kpis.querySelector('[data-field="battery_v"]').textContent = format(latest.battery_v, 2);
    kpis.querySelector('[data-field="rssi_dbm"]').textContent = format(latest.rssi_dbm, 0);

    rows.innerHTML = frames.map((frame) => {
      const received = new Date(frame.received_at).toLocaleTimeString();
      return `<tr>
        <td>${received}</td>
        <td>${frame.ground_station || '-'}</td>
        <td>${frame.sequence_number ?? '-'}</td>
        <td>${format(frame.altitude_m, 1)}</td>
        <td>${format(frame.battery_v, 2)}</td>
        <td>${format(frame.rssi_dbm, 0)}</td>
      </tr>`;
    }).join('');
  };

  const refreshTelemetry = async () => {
    try {
      const response = await fetch('/api/telemetry/latest/?limit=25');
      if (!response.ok) return;
      const data = await response.json();
      if (data.ok) renderFrames(data.frames);
    } catch (error) {
      // Initial server-rendered table remains if refresh fails.
    }
  };

  refreshTelemetry();
  window.setInterval(refreshTelemetry, 5000);
});
