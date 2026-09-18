/* eCoasters — no dependencies, ~3.5 KB.
   Degrades cleanly: without JS the page reads, the form posts, the FAQ opens. */

(() => {
  'use strict';

  // Tells the inline head script we made it — it stops its "unhide everything" timer.
  window.__ecoastersReady = true;

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Header + sticky CTA bar ──────────────────────────
     Every lookup here is optional. This file runs on the home page, the four
     detail pages and the legal pages, and they don't all have the same parts.
     A throw inside the rAF below would leave `ticking` stuck at true and kill
     scrolling behaviour for the whole page — so nothing here may throw. */
  const hdr    = $('#hdr');
  const ctaBar = $('#ctaBar');
  const hero   = $('.hero') || $('.phero');   // home uses .hero, detail pages .phero
  if (ctaBar) ctaBar.hidden = false;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      try {
        if (hdr) hdr.classList.toggle('is-stuck', scrollY > 40);
        // Surface the booking bar only once the hero is behind us.
        if (ctaBar && hero) ctaBar.classList.toggle('is-up', scrollY > hero.offsetHeight * 0.75);
      } finally {
        ticking = false;                        // never strand the throttle
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav ─────────────────────────────────────── */
  const burger = $('#burger'), nav = $('#nav');
  if (burger && nav) {
    const setNav = open => {
      nav.classList.toggle('is-open', open);
      // The stuck header's backdrop-filter makes it a containing block for the
      // fixed nav (its child), collapsing the open menu on scroll. Drop it while open.
      if (hdr) hdr.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
  }

  /* ── Scroll reveal ──────────────────────────────────── */
  const targets = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    targets.forEach(el => io.observe(el));
  }

  /* ── Sub-nav on the detail pages: highlight the section you're in ── */
  // Not gated on `reduced`: highlighting where you are is orientation, not motion.
  const subnav = $('#subnav');
  if (subnav && 'IntersectionObserver' in window) {
    const links = new Map();
    $$('a[href^="#"]', subnav).forEach(a => {
      const el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) links.set(el, a);
    });
    if (links.size) {
      const spy = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          links.forEach(a => a.classList.remove('is-here'));
          links.get(en.target).classList.add('is-here');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });   // fires when a section crosses mid-viewport
      links.forEach((_, el) => spy.observe(el));
    }
  }

  /* ── Cross-page hash landing ─────────────────────────────
     A hash link from another page (e.g. footer "Delivery areas" → rental #delivery)
     can land short: the browser jumps before the images above the target finish
     loading, then they push the target down. Re-apply the scroll once everything has
     loaded and settled. scrollIntoView honours the section's scroll-margin-top. */
  if (location.hash.length > 1) {
    const hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (hashTarget) {
      window.addEventListener('load', () => {
        setTimeout(() => hashTarget.scrollIntoView(), 60);
      });
    }
  }

  /* ── Meeting-point slideshow ─────────────────────────────
     Cross-fade the photos within a single frame. Left static (first slide only)
     when the visitor prefers reduced motion. */
  $$('.meet-slider').forEach(slider => {
    const slides = $$('.meet-slide', slider);
    if (slides.length < 2 || reduced) return;
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 4000);
  });

  /* ── Gallery lightbox (detail pages) ────────────────────
     The gallery anchors point at the full image so it works without JS. Here we
     upgrade them: open in an overlay, arrow left/right through the set, and close
     on backdrop-click or Esc. Guarded (no `return`) so the rest of the file runs
     on pages that have no gallery. */
  const galRows = $$('.galrow');

  /* Auto-scroll each gallery, while leaving it a real scroll container so the
     visitor can drag / swipe / wheel to any photo — the drift just pauses while
     they interact, then resumes. */
  galRows.forEach(row => {
    const track = row.querySelector('.galrow__track');
    if (!track || reduced) return;
    let paused = false, resumeTimer;
    const nudge = () => { paused = true; clearTimeout(resumeTimer); resumeTimer = setTimeout(() => { paused = false; }, 1600); };
    row.addEventListener('mouseenter', () => { paused = true; });
    row.addEventListener('mouseleave', () => { paused = false; });
    ['wheel', 'touchstart', 'pointerdown'].forEach(ev => row.addEventListener(ev, nudge, { passive: true }));
    const tick = () => {
      const loop = track.scrollWidth / 2;   // the track holds two identical copies
      if (!paused && loop > 0 && row.scrollWidth > row.clientWidth) {
        row.scrollLeft += 0.4;
        if (row.scrollLeft >= loop) row.scrollLeft -= loop;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  if (galRows.length) {
    const lb = document.createElement('div');
    lb.className = 'lbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Gallery image viewer');
    lb.hidden = true;
    lb.innerHTML =
        '<button class="lbox__btn lbox__close" type="button" aria-label="Close">'
      +   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
      + '<button class="lbox__btn lbox__nav lbox__prev" type="button" aria-label="Previous photo">'
      +   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>'
      + '<img class="lbox__img" alt="">'
      + '<button class="lbox__btn lbox__nav lbox__next" type="button" aria-label="Next photo">'
      +   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>'
      + '<p class="lbox__count" aria-live="polite"></p>';
    document.body.appendChild(lb);

    const lbImg   = $('.lbox__img', lb);
    const lbCount = $('.lbox__count', lb);
    let items = [], idx = 0, lastFocus = null;

    const render = () => {
      lbImg.src = items[idx];
      lbCount.textContent = `${idx + 1} / ${items.length}`;
    };
    const go = d => { idx = (idx + d + items.length) % items.length; render(); };
    const openLb = (list, i) => {
      items = list; idx = i; lastFocus = document.activeElement;
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      document.documentElement.style.overflow = 'hidden';
      render();
      $('.lbox__close', lb).focus();
    };
    const closeLb = () => {
      lb.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      setTimeout(() => { lb.hidden = true; lbImg.removeAttribute('src'); }, 250);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    galRows.forEach(row => {
      row.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (!a || !row.contains(a)) return;
        e.preventDefault();
        // Only the real anchors form the set; the loop needs duplicates but they aren't listed twice.
        const reals = $$('a:not([aria-hidden])', row);
        const list = reals.map(x => x.getAttribute('href'));
        let i = reals.indexOf(a);
        if (i < 0) i = Math.max(0, list.indexOf(a.getAttribute('href')));  // clicked a loop-dupe
        openLb(list, i);
      });
    });

    $('.lbox__close', lb).addEventListener('click', closeLb);
    $('.lbox__prev', lb).addEventListener('click', () => go(-1));
    $('.lbox__next', lb).addEventListener('click', () => go(1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });   // click outside the photo
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  }

  /* ── Hero background video (homepage) ───
     Desktop and mobile share the same two 1080p clips crossfading at the loop
     seam (mobile cover-crops them). Only attach when motion is allowed and the
     user isn't on a data saver — otherwise the poster frame stays. */
  const attach = v => { const s = v.querySelector('source[data-src]'); if (s && !s.src) { s.src = s.dataset.src; v.load(); } };
  const heroVids = $$('.hero__video');
  const saveData = navigator.connection && navigator.connection.saveData;
  if (heroVids.length && !reduced && !saveData) {
    const FADE = 0.8;                           // crossfade overlap, in seconds
    let active = 0;
    attach(heroVids[0]);
    heroVids[0].style.opacity = '1';
    heroVids[0].play().catch(() => {});         // autoplay can still be blocked; poster stays
    // Defer the 2nd clip so the first paints fast — it matters most on mobile data.
    const loadNext = () => attach(heroVids[1]);
    if ('requestIdleCallback' in window) requestIdleCallback(loadNext, { timeout: 3000 });
    else setTimeout(loadNext, 2500);
    heroVids.forEach((v, i) => v.addEventListener('timeupdate', () => {
      if (i !== active || !v.duration) return;
      if (v.duration - v.currentTime <= FADE) {
        const next = heroVids[1 - i];           // hand over to the other copy
        attach(next);                           // ensure it's loaded before the seam
        next.currentTime = 0;
        next.style.opacity = '1';
        v.style.opacity = '0';
        next.play().catch(() => {});
        active = 1 - i;
      }
    }));
  }

  /* ── Reviews carousel arrows (homepage) ─────────────── */
  const revTrack = $('#revTrack');
  if (revTrack) {
    $$('.rev2__arrow').forEach(btn => btn.addEventListener('click', () => {
      const card = revTrack.querySelector('.gcard');
      const step = (card ? card.getBoundingClientRect().width : 280) + 16;
      revTrack.scrollBy({ left: (+btn.dataset.dir) * step, behavior: reduced ? 'auto' : 'smooth' });
    }));
  }

  /* Everything past this point needs the booking form. The legal pages don't
     have one, and the header, nav and reveals above must still work there. */
  const form = $('#book');
  if (!form) return;
  const status = $('#formStatus');

  /* ── "Book this ride" preselects the tour ───────────── */
  const tourSelect = $('#f-tour');
  $$('[data-tour]').forEach(btn => btn.addEventListener('click', () => {
    const v = btn.dataset.tour;
    if ([...tourSelect.options].some(o => o.value === v)) { tourSelect.value = v; syncRental(); }
  }));

  /* ── Bike rental swaps the single date for pick-up + drop-off ──
     The inactive date field(s) are disabled so they're skipped by validation
     and left out of the submitted FormData. */
  const tourDateField = $('#tourDateField'), rentalDates = $('#rentalDates'), whatRow = $('#whatRow');
  const fDate = $('#f-date'), fTime = $('#f-time');                 // tour: calendar + clock
  const pDate = $('#f-pickup-date'), pTime = $('#f-pickup-time');   // pick-up: calendar + clock
  const rDate = $('#f-return-date'), rTime = $('#f-return-time');   // drop-off: calendar + clock
  const tourFields = [fDate, fTime], rentalFields = [pDate, pTime, rDate, rTime];
  const isRental = () => tourSelect.value === 'Bike rental';
  const syncRental = () => {
    const rental = isRental();
    if (tourDateField) tourDateField.hidden = rental;
    if (rentalDates)   rentalDates.hidden   = !rental;
    if (whatRow)       whatRow.classList.toggle('one-col', rental);
    tourFields.forEach(el   => { if (el) { el.disabled = rental;  el.required = false; } });
    rentalFields.forEach(el => { if (el) { el.disabled = !rental; el.required = rental; } });
    ['f-date', 'f-time', 'f-pickup-date', 'f-pickup-time', 'f-return-date', 'f-return-time']
      .forEach(id => { const el = $('#' + id); if (el && el.disabled) clearErr(id); });
  };
  tourSelect.addEventListener('change', syncRental);

  /* ── Live price estimate ────────────────────────────────
     Rental: live total from the pick-up / drop-off dates and bike count, using
     the tiered per-day rates (a same-day rental counts as a half day).
     Tour: per-person price (from the selected option's data-price) × riders.
     Estimate only — the booking is still confirmed by a human. */
  const calcBox = $('#rentalCalc');
  if (calcBox) {
    const calcTotal = $('#calcTotal'), calcBreak = $('#calcBreak'), people = $('#f-people');
    const perDay = d => d >= 7 ? 22.5 : d >= 5 ? 25 : d >= 3 ? 30 : 35;
    const money  = n => '€' + (n % 1 ? n.toFixed(2) : String(n));
    const riderCount = () => Math.min(20, Math.max(1, parseInt(people && people.value, 10) || 1));
    const perPerson = () => {                            // fixed per-person price of the picked tour, or NaN
      const o = tourSelect.options[tourSelect.selectedIndex];
      return o ? parseFloat(o.dataset.price) : NaN;
    };
    const updateCalc = () => {
      // No estimate until the visitor has entered how many riders/bikes.
      if (!people || !(people.value || '').trim()) { calcBox.hidden = true; return; }
      const n = riderCount();
      if (isRental()) {                                  // ── rental: dates × bikes ──
        if (!pDate || !rDate || !pDate.value || !rDate.value) { calcBox.hidden = true; return; }
        const days = Math.round((new Date(rDate.value) - new Date(pDate.value)) / 864e5);
        if (isNaN(days) || days < 0) { calcBox.hidden = true; return; }
        const bikeTxt = n + (n > 1 ? ' bikes' : ' bike');
        let total, detail;
        if (days === 0) {                                // same day → half day
          total = 25 * n;
          detail = `${bikeTxt} · half day · €25 each`;
        } else {
          const rate = perDay(days);
          total = rate * days * n;
          detail = `${bikeTxt} · ${days} day${days > 1 ? 's' : ''} · ${money(rate)}/day`;
        }
        calcTotal.textContent = money(total);
        calcBreak.textContent = detail;
        calcBox.hidden = false;
      } else {                                           // ── tour: per person × riders ──
        const pp = perPerson();
        if (isNaN(pp)) { calcBox.hidden = true; return; } // e.g. "Private / group" has no fixed price
        const riderTxt = n + (n > 1 ? ' riders' : ' rider');
        calcTotal.textContent = money(pp * n);
        calcBreak.textContent = `${riderTxt} · ${money(pp)} each`;
        calcBox.hidden = false;
      }
    };
    [pDate, rDate, people].forEach(el => el && el.addEventListener('input', updateCalc));
    tourSelect.addEventListener('change', updateCalc);
    updateCalc();
  }

  /* ── Validation ─────────────────────────────────────── */

  // Join a date field and its time field into one comparable value, or null if either is blank.
  const combine = (d, t) => (d && t && d.value && t.value) ? d.value + 'T' + t.value : null;
  const notPast = v => {
    const d = new Date(v + 'T00:00'), t = new Date(); t.setHours(0, 0, 0, 0);
    return d >= t;
  };
  const afterPickup = () => {
    const p = combine(pDate, pTime), r = combine(rDate, rTime);
    return !p || !r || new Date(r) > new Date(p);   // only judge once both are complete
  };

  const rules = {
    'f-name'  : v => v.trim().length >= 2 || 'Tell us your name so we know who is riding.',
    'f-email' : v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email looks off — check for a typo.',
    'f-people': v => (+v >= 1 && +v <= 20) || 'Between 1 and 20 riders. More than that? Message us.',
    'f-date'  : v => !v || notPast(v) || 'That date has already passed.',   // optional; only checked if filled
    'f-time'  : () => true,                                                  // preferred time is optional
    'f-pickup-date': v => v ? (notPast(v) || 'That date has already passed.') : 'Pick a day to collect the bike.',
    'f-pickup-time': v => v ? true : 'Add a pick-up time.',
    'f-return-date': v => {
      if (!v) return 'Pick a day to return the bike.';
      if (!notPast(v)) return 'That date has already passed.';
      return afterPickup() || 'Drop-off must be after pick-up.';
    },
    'f-return-time': v => {
      if (!v) return 'Add a drop-off time.';
      return afterPickup() || 'Drop-off must be after pick-up.';
    },
  };

  const setErr = (id, msg) => {
    const f = $('#' + id), box = $('#e-' + id.slice(2));
    f.setAttribute('aria-invalid', 'true');
    if (box) { box.textContent = msg; box.hidden = false; f.setAttribute('aria-describedby', box.id); }
  };
  const clearErr = id => {
    const f = $('#' + id), box = $('#e-' + id.slice(2));
    f.removeAttribute('aria-invalid');
    if (box) { box.hidden = true; f.removeAttribute('aria-describedby'); }
  };
  const validate = id => {
    const el = $('#' + id);
    if (el.disabled) { clearErr(id); return true; }   // inactive date group — skip
    const r = rules[id](el.value);
    r === true ? clearErr(id) : setErr(id, r);
    return r === true;
  };

  // Validate on blur, never mid-keystroke.
  Object.keys(rules).forEach(id => {
    const el = $('#' + id);
    el.addEventListener('blur', () => validate(id));
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid')) validate(id); });
  });

  const validateAll = () => {
    const bad = Object.keys(rules).filter(id => !validate(id));
    if (bad.length) {
      $('#' + bad[0]).focus();
      status.textContent = `Check ${bad.length} field${bad.length > 1 ? 's' : ''} above.`;
      status.dataset.state = 'bad';
    }
    return !bad.length;
  };

  /* ── One message, three destinations ────────────────── */
  const compose = () => {
    const g = id => $('#' + id).value.trim();
    const dates = isRental()
      ? [`Bike pick-up: ${g('f-pickup-date')} ${g('f-pickup-time')}`,
         `Bike drop-off: ${g('f-return-date')} ${g('f-return-time')}`]
      : [`Date: ${`${g('f-date')} ${g('f-time')}`.trim() || 'to be confirmed'}`];
    return [
      `Booking request — ${g('f-tour')}`, ``,
      `Name: ${g('f-name')}`,
      `Email: ${g('f-email')}`,
      g('f-phone') ? `Phone: ${g('f-phone')}` : null,
      `Riders: ${g('f-people')}`,
      ...dates,
      g('f-promo') ? `Promo code: ${g('f-promo')}` : null,
      g('f-msg') ? `\nNotes: ${g('f-msg')}` : null,
    ].filter(Boolean).join('\n');
  };

  $('#waSend').addEventListener('click', () => {
    if (!validateAll()) return;
    open('https://wa.me/351969638466?text=' + encodeURIComponent(compose()), '_blank', 'noopener');
  });

  /* ── Submit ─────────────────────────────────────────── */
  const btn = $('#submitBtn');
  // Web3Forms: while the access key is still the placeholder, fall back to the
  // visitor's mail client instead of POSTing (which would fail with a bad key).
  const keyField = form.querySelector('[name="access_key"]');
  const NOT_CONFIGURED = !keyField || keyField.value.includes('YOUR_ACCESS_KEY');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateAll()) return;

    // No form backend wired up yet → hand off to the visitor's mail client.
    if (NOT_CONFIGURED) {
      location.href = 'mailto:ecoasters24@gmail.com'
        + '?subject=' + encodeURIComponent(`Booking request — ${$('#f-tour').value}`)
        + '&body='    + encodeURIComponent(compose());
      status.textContent = 'Opening your email app…';
      status.dataset.state = 'ok';
      return;
    }

    btn.disabled = true;
    const label = btn.innerHTML;
    btn.textContent = 'Sending…';
    status.textContent = '';
    status.removeAttribute('data-state');

    try {
      const res = await fetch(form.action, {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = 'Got it. We\'ll reply within the day.';
      status.dataset.state = 'ok';
    } catch {
      status.innerHTML = 'That didn\'t send. Message us on '
        + '<a href="https://wa.me/351969638466">WhatsApp</a> and we\'ll sort it out.';
      status.dataset.state = 'bad';
    } finally {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  });

  /* ── Native date pickers: no past dates, and a sane upper bound ──
     Without a `max`, the browser lets the year spinner grow to 6 digits.
     Capping it a few years out keeps the year field at 4 digits. */
  const maxYear = new Date().getFullYear() + 5;
  const todayStr = new Date().toISOString().split('T')[0], maxStr = `${maxYear}-12-31`;
  [fDate, pDate, rDate].forEach(el => { el.min = todayStr; el.max = maxStr; });
  // Drop-off can't be before the pick-up day.
  pDate.addEventListener('change', () => { if (pDate.value) rDate.min = pDate.value; });

  /* Open the native calendar (date) or clock (time) picker on any click, not just
     the tiny icon. showPicker() needs a user gesture — a click qualifies — and
     isn't in every browser, so it's feature-detected and wrapped. */
  [fDate, fTime, pDate, pTime, rDate, rTime].forEach(el => {
    if (typeof el.showPicker !== 'function') return;
    el.addEventListener('click', () => {
      if (!el.disabled) { try { el.showPicker(); } catch {} }
    });
  });

  syncRental();   // initial state — the rental page pre-selects "Bike rental"
})();
