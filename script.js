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
  } catch (error) {
    console.warn('Interface sound unavailable:', error);
  }
};

tiltElements.forEach(element => {
  element.addEventListener('pointermove', event => {
    if (reduceMotion.matches || window.innerWidth < 768) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
  });
  element.addEventListener('pointerleave', () => {
    element.style.transform = '';
  });
});

document.querySelectorAll('a, button').forEach(element => {
  element.addEventListener('click', () => playClick(440));
});

const walkthroughLayer = document.querySelector('.walkthrough-layer');
const walkthroughCursor = document.querySelector('.walkthrough-cursor');
const walkthroughText = walkthroughCursor?.querySelector('strong');
const walkthroughStart = document.querySelector('.foot-tour');
const walkthroughStatus = document.querySelector('.walkthrough-status');
const stickyNotes = document.querySelector('.sticky-notes');
const notesCookie = 'abdulhadi_walkthrough_notes';

const walkthroughSteps = [
  { selector: '.hero-title', label: 'This is the signal: Abdulhadi builds production AI systems, not just prompts.', note: 'Hero: the core positioning and first action.' },
  { selector: '.proof-strip', label: 'The build log gives a quick read on shipping volume and public proof.', note: 'Proof: 58 repositories, 839 yearly contributions, 4 products.' },
  { selector: '#about .about-text', label: 'The background: inference, agents, search, quantization research, and full-stack delivery.', note: 'About: AI engineer and founder, Karachi.' },
  { selector: '#work .work-featured', label: 'The featured case study is Trillionir AI, the flat-rate inference platform.', note: 'Work: Trillionir, Sodeom, TriMind, and the automation stack.' },
  { selector: '#skills .skill-card-accent', label: 'The skills matrix shows the AI and LLM systems specialty first.', note: 'Skills: orchestration, evaluation, routing, and quantization.' },
  { selector: '#education .edu', label: 'The education band shows the Agentic AI program at SMIT.', note: 'Education: Agentic AI program, SMIT.' },
  { selector: '#contact .contact-box', label: 'The final plate is the handoff: website, email, GitHub, LinkedIn, and HuggingFace.', note: 'Contact: use this plate to start a conversation.' },
  { selector: 'footer', label: 'That is the full portfolio. Replay the tour any time from the footer.', note: 'End: replay the tour or use the contact links.' }
];

const readNotes = () => {
  const match = document.cookie.split('; ').find(item => item.startsWith(`${notesCookie}=`));
  if (!match) return [];
  try {
    const notes = JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
    return Array.isArray(notes) ? notes.slice(0, 8) : [];
  } catch (error) {
    console.warn('Saved tour notes could not be read:', error);
    return [];
  }
};

const writeNotes = notes => {
  const safeNotes = notes.slice(-8).map(note => ({
    id: String(note.id),
    text: String(note.text).slice(0, 180)
  }));
  document.cookie = `${notesCookie}=${encodeURIComponent(JSON.stringify(safeNotes))}; max-age=31536000; path=/; SameSite=Lax`;
};

const addStickyNote = (step, index) => {
  const id = `tour-${index}`;
  const notes = readNotes().filter(note => note.id !== id);
  notes.push({ id, text: step.note });
  writeNotes(notes);
  if (!stickyNotes) return;
  document.querySelector(`[data-note-id="${CSS.escape(id)}"]`)?.remove();
  const note = document.createElement('div');
  note.className = 'sticky-note';
  note.dataset.noteId = id;
  note.style.right = `${24 + (index % 2) * 205}px`;
  note.style.top = `${Math.min(window.innerHeight - 150, 100 + (index % 3) * 130)}px`;
  note.textContent = step.note;
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Dismiss note');
  close.addEventListener('click', () => {
    writeNotes(readNotes().filter(item => item.id !== id));
    note.remove();
  });
  note.prepend(close);
  stickyNotes.append(note);
};

const moveWalkthroughCursor = (element, text) => {
  if (!walkthroughLayer || !walkthroughCursor || !element) return;
  const rect = element.getBoundingClientRect();
  walkthroughCursor.style.left = `${Math.max(28, Math.min(window.innerWidth - 28, rect.left + Math.min(rect.width / 2, 80)))}px`;
  walkthroughCursor.style.top = `${Math.max(90, Math.min(window.innerHeight - 40, rect.top + Math.min(rect.height / 2, 80)))}px`;
  if (walkthroughText) walkthroughText.textContent = text;
};

const wait = milliseconds => new Promise(resolve => window.setTimeout(resolve, milliseconds));
let walkthroughRunning = false;

async function startWalkthrough() {
  if (walkthroughRunning) return;
  walkthroughRunning = true;
  walkthroughLayer?.classList.add('active');
  if (walkthroughStatus) walkthroughStatus.textContent = 'Tour in progress...';
  for (let index = 0; index < walkthroughSteps.length; index += 1) {
    const step = walkthroughSteps[index];
    const element = document.querySelector(step.selector);
    if (!element) continue;
    document.querySelectorAll('.walkthrough-target').forEach(target => target.classList.remove('walkthrough-target'));
    element.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    await wait(reduceMotion.matches ? 50 : 650);
    element.classList.add('walkthrough-target');
    moveWalkthroughCursor(element, step.label);
    addStickyNote(step, index);
    if (walkthroughStatus) walkthroughStatus.textContent = `Tour ${index + 1} of ${walkthroughSteps.length}`;
    await wait(reduceMotion.matches ? 550 : 2300);
  }
  document.querySelectorAll('.walkthrough-target').forEach(target => target.classList.remove('walkthrough-target'));
  walkthroughLayer?.classList.remove('active');
  walkthroughRunning = false;
  if (walkthroughStatus) walkthroughStatus.textContent = 'Tour complete. Notes saved in this browser.';
}

walkthroughStart?.addEventListener('click', startWalkthrough);
