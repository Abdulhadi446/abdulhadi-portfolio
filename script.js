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
  mobileMenu?.classList.remove('open');
};

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
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
