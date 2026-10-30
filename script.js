document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- scroll reveal ---------- */
const revealElements = document.querySelectorAll('.reveal');
const reveal = (element) => {
  element.classList.add('on');
  observer?.unobserve(element);
};
let observer;
if ('IntersectionObserver' in window) {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(reveal);
}

/* ---------- mobile menu (3-state sync) ---------- */
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const closeMenu = () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation menu');
  mobileMenu?.classList.remove('open');
};
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  mobileMenu.classList.toggle('open', !isOpen);
  if (!isOpen) mobileMenu?.querySelector('a')?.focus(); // keyboard: land inside the open menu
});
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const wasOpen = mobileMenu?.classList.contains('open');
  closeMenu();
  if (wasOpen) menuToggle?.focus(); // return focus to the toggle
});

/* ---------- scroll-spy ---------- */
const sections = document.querySelectorAll('section[id]');
const sectionLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => sectionObserver.observe(section));
}

/* ---------- proof-strip count-up ---------- */
const proofStrip = document.querySelector('.proof-strip');
const animateCounts = () => {
  proofStrip?.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (!Number.isFinite(target)) return;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  });
};
if (proofStrip && 'IntersectionObserver' in window && !reduceMotion.matches) {
  let counted = false;
  const proofObserver = new IntersectionObserver(entries => {
    if (counted || !entries.some(entry => entry.isIntersecting)) return;
    counted = true;
    animateCounts();
    proofObserver.disconnect();
  }, { threshold: 0.4 });
  proofObserver.observe(proofStrip);
}

/* ---------- tilt + interface click sound ---------- */
const tiltElements = document.querySelectorAll('[data-tilt]');
let audioContext;
const playClick = (tone = 520) => {
  if (reduceMotion.matches) return;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(tone, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(tone * 1.35, audioContext.currentTime + 0.06);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.11);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch (error) { /* sound unavailable */ }
};
tiltElements.forEach(element => {
  element.addEventListener('pointermove', event => {
    if (reduceMotion.matches || window.innerWidth < 768) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
});
document.querySelectorAll('a, button').forEach(element => {
  element.addEventListener('click', () => playClick(440));
});

/* ============================================================
   TERMINAL BOOT (index / gateway only)
   ============================================================ */
const boot = document.getElementById('boot');
const gateway = document.getElementById('gateway');

const bootLines = [
  { t: '$ abdh --init', c: 'dim' },
  { t: '> signal core online', c: '' },
  { t: '> loading kernels [66 public repos]', c: '' },
  { t: '> quantizing weights to 1.58-bit ternary', c: '' },
  { t: '> routing inference endpoints', c: '' },
  { t: '> evaluation pipeline: openbench', c: '' },
  { t: '> portfolios ready', c: 'ok' },
  { t: '> select a signal to continue', c: 'warn' }
];

const finishBoot = () => {
  if (!boot || boot.classList.contains('done')) return;
  boot.classList.add('done');
  document.body.classList.remove('boot-lock');
  gateway?.classList.add('show');
  document.getElementById('bootSkip')?.setAttribute('tabindex', '-1');
  // move focus into the gateway for keyboard users
  gateway?.querySelector('a')?.focus?.({ preventScroll: true });
};

const runBoot = () => {
  if (!boot || !gateway) return;
  const linesEl = document.getElementById('bootLines');
  const fill = document.getElementById('bootFill');
  const pct = document.getElementById('bootPct');
  if (reduceMotion.matches) { finishBoot(); return; }

  document.body.classList.add('boot-lock');
  let i = 0;
  const step = () => {
    if (i >= bootLines.length) {
      if (fill) fill.style.width = '100%';
      if (pct) pct.textContent = '100%';
      window.setTimeout(finishBoot, 620);
      return;
    }
    const line = bootLines[i];
    const div = document.createElement('div');
    div.className = 'boot-line' + (line.c ? ` ${line.c}` : '');
    div.textContent = line.t;
    linesEl?.appendChild(div);
    const progress = Math.round(((i + 1) / bootLines.length) * 100);
    if (fill) fill.style.width = progress + '%';
    if (pct) pct.textContent = progress + '%';
    i += 1;
    window.setTimeout(step, 260 + Math.random() * 160);
  };
  step();
};

if (boot && gateway) {
  // reduced-motion users skip the whole thing
  runBoot();
  document.getElementById('bootSkip')?.addEventListener('click', finishBoot);
  // allow Enter / Space anywhere to skip
  document.addEventListener('keydown', (e) => {
    if (!boot.classList.contains('done') && (e.key === 'Enter' || e.key === ' ')) {
      if (document.getElementById('bootSkip') === document.activeElement) return; // let button handle it
      e.preventDefault();
      finishBoot();
    }
  });
}

/* ============================================================
   KEYBOARD LAYER — the whole site is usable without a mouse.
   ?          show/hide shortcut help (works on every page)
   g + letter jump to a section (w work, s skills, a about,
              e education, c contact)
   0          back to the gateway   n / p  next / previous track
   j / k      scroll down / up      Esc    close help or menu
   gateway:   arrows (or j/k) choose a track, 1-5 open it,
              Home / End jump to first / last, Enter opens
   ============================================================ */
const isGatewayPage = Boolean(document.getElementById('gateway'));
const isTypingTarget = (element) => Boolean(element) &&
  (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' ||
   element.tagName === 'SELECT' || element.isContentEditable);

const COMMON_KEYS = [
  ['?', 'Show or hide this help'],
  ['Esc', 'Close this panel or the menu'],
  ['Tab Shift+Tab', 'Move between controls'],
  ['Enter', 'Activate the focused control']
];
const GATEWAY_KEYS = [
  ...COMMON_KEYS.slice(0, 2),
  ['\u2193 \u2191 j k', 'Choose a track'],
  ['1 2 3 4 5', 'Open that track'],
  ['Home End', 'Jump to the first or last track'],
  ['Enter', 'Open the focused track'],
  ...COMMON_KEYS.slice(2)
];
const PAGE_KEYS = [
  ...COMMON_KEYS.slice(0, 2),
  ['g w', 'Jump to Work'],
  ['g s', 'Jump to Skills'],
  ['g a', 'Jump to About'],
  ['g e', 'Jump to Education'],
  ['g c', 'Jump to Contact'],
  ['j k', 'Scroll down or up'],
  ['0', 'Back to all tracks (gateway)'],
  ['n p', 'Next or previous track'],
  ...COMMON_KEYS.slice(2)
];

const kbdOverlay = document.createElement('div');
kbdOverlay.className = 'kbd-overlay';
kbdOverlay.hidden = true;
kbdOverlay.setAttribute('role', 'dialog');
kbdOverlay.setAttribute('aria-modal', 'true');
kbdOverlay.setAttribute('aria-label', 'Keyboard shortcuts');
const kbdRows = (isGatewayPage ? GATEWAY_KEYS : PAGE_KEYS).map(([keys, label]) =>
  `<div class="kbd-row"><span class="kbd-label">${label}</span>` +
  `<span class="kbd-keys">${keys.split(' ').map(key => `<kbd>${key}</kbd>`).join('')}</span></div>`
).join('');
kbdOverlay.innerHTML =
  '<div class="kbd-card" tabindex="-1">' +
  '<h2>Keyboard shortcuts</h2>' +
  '<p class="kbd-hint">This site is fully keyboard operable. No mouse needed.</p>' +
  `<div class="kbd-list">${kbdRows}</div>` +
  '<button type="button" class="kbd-close">Close (Esc)</button>' +
  '</div>';
document.body.appendChild(kbdOverlay);
const kbdCard = kbdOverlay.querySelector('.kbd-card');
let kbdLastFocus = null;
const openKbd = () => {
  if (!kbdOverlay.hidden) return;
  kbdLastFocus = document.activeElement;
  kbdOverlay.hidden = false;
  kbdCard.focus();
};
const closeKbd = () => {
  if (kbdOverlay.hidden) return;
  kbdOverlay.hidden = true;
  try { kbdLastFocus?.focus?.(); } catch { /* element gone */ }
};
kbdOverlay.addEventListener('click', (event) => {
  if (event.target === kbdOverlay || event.target.closest('.kbd-close')) closeKbd();
});

const roleButtons = Array.from(document.querySelectorAll('.role-btn'));
const moveRoleFocus = (delta, whence) => {
  if (!roleButtons.length) return;
  if (boot && !boot.classList.contains('done')) return; // gateway not interactive yet
  const index = roleButtons.indexOf(document.activeElement);
  let next;
  if (whence === 'home') next = 0;
  else if (whence === 'end') next = roleButtons.length - 1;
  else if (index < 0) next = delta > 0 ? 0 : roleButtons.length - 1;
  else next = (index + delta + roleButtons.length) % roleButtons.length;
  roleButtons[next].focus();
};

const SECTION_BY_KEY = { w: 'work', s: 'skills', a: 'about', e: 'education', c: 'contact' };
const jumpToSection = (id) => {
  const target = document.getElementById(id);
  if (!target) return false;
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  return true;
};

const TRACK_PAGES = [
  'ai-ml-engineer.html', 'ai-automation-engineer.html', 'founder.html',
  'fullstack-developer.html', 'forward-deployed-engineer.html'
];
const gotoTrack = (delta) => {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  let index = TRACK_PAGES.indexOf(current);
  if (index < 0) index = delta > 0 ? -1 : 0;
  window.location.href = TRACK_PAGES[(index + delta + TRACK_PAGES.length) % TRACK_PAGES.length];
};

const scrollPage = (direction) => window.scrollBy({
  top: direction * window.innerHeight * 0.85,
  behavior: reduceMotion.matches ? 'auto' : 'smooth'
});

let gArmed = false;
let gTimer = 0;
document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key;

  // help overlay open: trap focus, Esc / ? close it
  if (!kbdOverlay.hidden) {
    if (key === 'Escape' || key === '?') { event.preventDefault(); closeKbd(); }
    else if (key === 'Tab') {
      event.preventDefault();
      const closeBtn = kbdOverlay.querySelector('.kbd-close');
      (document.activeElement === kbdCard ? closeBtn : kbdCard).focus();
    }
    return;
  }

  if (isTypingTarget(event.target)) return; // never hijack typing (Sodeom search box)
  if (key === '?') { event.preventDefault(); openKbd(); return; }

  // g then a section letter
  if (gArmed) {
    gArmed = false;
    window.clearTimeout(gTimer);
    if (!isGatewayPage && jumpToSection(SECTION_BY_KEY[key])) { event.preventDefault(); return; }
  }
  if (key === 'g' && !isGatewayPage) {
    gArmed = true;
    gTimer = window.setTimeout(() => { gArmed = false; }, 1200);
    return;
  }

  if (isGatewayPage) {
    if (key === 'ArrowDown' || key === 'ArrowRight' || key === 'j') { event.preventDefault(); moveRoleFocus(1); return; }
    if (key === 'ArrowUp' || key === 'ArrowLeft' || key === 'k') { event.preventDefault(); moveRoleFocus(-1); return; }
    if (key === 'Home') { event.preventDefault(); moveRoleFocus(0, 'home'); return; }
    if (key === 'End') { event.preventDefault(); moveRoleFocus(0, 'end'); return; }
    if (/^[1-5]$/.test(key)) {
      const button = roleButtons[Number(key) - 1];
      if (button && boot?.classList.contains('done')) { event.preventDefault(); button.click(); }
      return;
    }
    return;
  }

  if (key === 'j') { event.preventDefault(); scrollPage(1); return; }
  if (key === 'k') { event.preventDefault(); scrollPage(-1); return; }
  if (key === '0') { event.preventDefault(); window.location.href = 'index.html'; return; }
  if (key === 'n') { event.preventDefault(); gotoTrack(1); return; }
  if (key === 'p') { event.preventDefault(); gotoTrack(-1); return; }
});
