document.documentElement.classList.add('js');

const revealElements = document.querySelectorAll('.reveal');
const reveal = (element) => {
  element.classList.add('on');
  observer?.unobserve(element);
};

let observer;
if ('IntersectionObserver' in window) {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) reveal(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(reveal);
}

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
});
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

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

const themeToggle = document.querySelector('.theme-toggle');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const effectiveTheme = () => {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return darkQuery.matches ? 'dark' : 'light';
};

const syncThemeToggle = () => {
  if (!themeToggle) return;
  const current = effectiveTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
  const label = themeToggle.querySelector('span');
  if (label) label.textContent = next[0].toUpperCase() + next.slice(1);
};

themeToggle?.addEventListener('click', () => {
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  syncThemeToggle();
});
darkQuery.addEventListener?.('change', syncThemeToggle);
syncThemeToggle();

const proofStrip = document.querySelector('.proof-strip');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
