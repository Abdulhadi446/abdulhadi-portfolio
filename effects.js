/* ============================================================
   effects.js  —  the optional motion layer, loaded after script.js
   on every page. Three independent layers on one shared rAF ticker:

     field   faint drifting instrument noise behind the content
     lens    a small cursor lens + short trail (difference blend)
     magnet  buttons lean a few px toward the cursor, no overshoot

   Nothing here is load-bearing: delete the file and the site renders
   and behaves exactly the same. All layers are off under reduced
   motion; lens and magnet are off on touch. Canvases never take
   pointer events, so no click, focus ring or selection is affected.

   Tune the four values below; window.FX.off() kills everything live.
   ============================================================ */
(() => {
  'use strict';

  const CONFIG = {
    field:  { on: true, max: 44, density: 34000, alpha: .16, link: 108, linkAlpha: .085, speed: .12, repel: 130 },
    lens:   { on: true, head: 8, ink: 88, trailMs: 850, follow: .3 },
    magnet: { on: true, pull: .08, radius: 160, maxShift: 6, selector: '.nav-cta, .btn-primary, .foot-back, .role-btn' }
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const layers = [];      // draw callbacks, one per active layer
  const teardowns = [];
  let raf = 0;

  /* one pointer read shared by every layer */
  const pointer = { x: -9999, y: -9999, seen: false };
  addEventListener('pointermove', event => {
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.seen = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    pointer.seen = false; pointer.x = pointer.y = -9999;
  });

  /* a failing layer is dropped, never allowed to kill the others */
  const tick = now => {
    raf = requestAnimationFrame(tick);
    for (let i = layers.length - 1; i >= 0; i--) {
      try { layers[i](now); }
      catch (error) { console.warn('effects: layer disabled', error); layers.splice(i, 1); }
    }
  };
  const start = () => { if (!raf && layers.length && !document.hidden) raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  /* both layers are soft, faint marks: 1.5x is plenty and keeps the
     per-frame pixel work down on machines without a GPU */
  const makeCanvas = (className, behind) => {
    const canvas = document.createElement('canvas');
    canvas.className = className;
    canvas.setAttribute('aria-hidden', 'true');
    /* styled inline so the layer never depends on the stylesheet loading,
       and can never take up layout space if that stylesheet is stale */
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;' +
      (behind ? 'z-index:-1' : 'z-index:55;mix-blend-mode:difference');
    const ctx = canvas.getContext('2d');
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    addEventListener('resize', size, { passive: true });
    size();
    return { canvas, ctx, size };
  };

  /* the page's own accent, so the field stays on-brand per track */
  const accentRGB = () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const hex = /^#?([0-9a-f]{6})$/i.exec(raw);
    if (!hex) return '236,238,241';
    const n = parseInt(hex[1], 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  };

  /* ---- layer 1: drifting field ---- */
  const field = config => {
    const { canvas, ctx } = makeCanvas('fx-field', true);
    document.body.prepend(canvas);
    const ink = '162,167,176';
    const signal = accentRGB();
    const dots = [];
    let W = innerWidth, H = innerHeight;

    const resize = () => {
      W = innerWidth; H = innerHeight;
      const want = Math.min(config.max, Math.round(W * H / config.density));
      while (dots.length < want) dots.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * config.speed * 2,
        vy: (Math.random() - .5) * config.speed * 2,
        r: .8 + Math.random() * 1.1
      });
      dots.length = want;
    };
    addEventListener('resize', resize, { passive: true });
    resize();

    layers.push(() => {
      ctx.clearRect(0, 0, W, H);
      for (const dot of dots) {
        dot.x += dot.vx; dot.y += dot.vy;
        if (dot.x < 0 || dot.x > W) dot.vx *= -1;
        if (dot.y < 0 || dot.y > H) dot.vy *= -1;
        let near = 0;
        if (pointer.seen) {
          const dx = dot.x - pointer.x, dy = dot.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < config.repel && d > 0) {
            near = 1 - d / config.repel;
            const push = near * 1.1;
            dot.x += dx / d * push; dot.y += dy / d * push;
          }
        }
        /* neutral noise at rest, a whisper of the track accent near the cursor */
        ctx.fillStyle = near > .02
          ? `rgba(${signal},${(config.alpha + near * .2).toFixed(3)})`
          : `rgba(${ink},${config.alpha})`;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 1;
      const limit = config.link * config.link;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const sq = dx * dx + dy * dy;
          if (sq > limit) continue;
          const fade = 1 - Math.sqrt(sq) / config.link;
          ctx.strokeStyle = `rgba(${ink},${(fade * config.linkAlpha).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
        }
      }
    });
    return () => canvas.remove();
  };

  /* ---- layer 2: cursor lens + trail ----
     difference blend: transparent changes nothing, gray partly inverts.
     'lighten' compositing keeps overlaps at the max, so no beads.
     Only the rectangle the trail actually touched is cleared each frame,
     so an idle cursor costs nothing. */
  const lens = config => {
    const { canvas, ctx } = makeCanvas('fx-cursor', false);
    document.body.appendChild(canvas);
    const head = { x: -9999, y: -9999 };
    const points = [];
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const pad = config.head * 2 + 2;
    let dirty = null, rested = false;

    const wipe = box => {
      if (!box) return;
      ctx.clearRect(box.x0 - pad, box.y0 - pad, box.x1 - box.x0 + pad * 2, box.y1 - box.y0 + pad * 2);
    };
    const bounds = () => ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    const mark = (box, x, y) => {
      if (x < box.x0) box.x0 = x; if (x > box.x1) box.x1 = x;
      if (y < box.y0) box.y0 = y; if (y > box.y1) box.y1 = y;
    };

    layers.push(now => {
      if (!pointer.seen && !points.length) {
        if (dirty) { wipe(dirty); dirty = null; rested = false; }
        return;
      }
      if (pointer.seen) {
        if (head.x < -999) { head.x = pointer.x; head.y = pointer.y; }
        head.x += (pointer.x - head.x) * config.follow;
        head.y += (pointer.y - head.y) * config.follow;
        const last = points[points.length - 1];
        if (!last || Math.hypot(head.x - last.x, head.y - last.y) > .5) points.push({ x: head.x, y: head.y, t: now });
      }
      while (points.length && now - points[0].t > config.trailMs) points.shift();

      /* cursor parked, trail gone: the painted head is already correct */
      if (!points.length && rested) return;
      rested = !points.length && pointer.seen;

      wipe(dirty);
      const box = bounds();
      ctx.globalCompositeOperation = 'lighten';
      ctx.lineCap = ctx.lineJoin = 'round';
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        const life = Math.max(0, 1 - (now - point.t) / config.trailMs);
        const from = mid(points[i - 1], point);
        const to = i < points.length - 1 ? mid(point, points[i + 1]) : head;
        const g = Math.round(config.ink * life * life);
        ctx.strokeStyle = `rgb(${g},${g},${g})`;
        ctx.lineWidth = config.head * 2 * (.35 + .65 * life);
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.quadraticCurveTo(point.x, point.y, to.x, to.y); ctx.stroke();
        mark(box, from.x, from.y); mark(box, point.x, point.y); mark(box, to.x, to.y);
      }
      if (pointer.seen) {
        ctx.fillStyle = `rgb(${config.ink},${config.ink},${config.ink})`;
        ctx.beginPath(); ctx.arc(head.x, head.y, config.head, 0, Math.PI * 2); ctx.fill();
        mark(box, head.x, head.y);
      }
      ctx.globalCompositeOperation = 'source-over';
      dirty = box.x0 === Infinity ? null : box;
    });
    return () => canvas.remove();
  };

  /* ---- layer 3: magnetic buttons ----
     writes the independent 'translate' property, so hover transforms
     in the page CSS keep working instead of being overwritten. */
  const magnet = config => {
    const spring = () => ({ x: 0, v: 0 });
    const step = (s, target) => { s.v = (s.v + (target - s.x) * .12) * .82; s.x += s.v; return s.x; };
    const clamp = value => Math.max(-config.maxShift, Math.min(config.maxShift, value));
    const items = [...document.querySelectorAll(config.selector)]
      .map(el => ({ el, sx: spring(), sy: spring(), written: false }));
    if (!items.length) return () => {};

    layers.push(() => {
      for (const item of items) {
        const rect = item.el.getBoundingClientRect();
        if (!rect.width) continue;                       // hidden (mobile nav CTA)
        const cx = rect.left + rect.width / 2 - item.sx.x;
        const cy = rect.top + rect.height / 2 - item.sy.x;
        const dx = pointer.x - cx, dy = pointer.y - cy;
        const falloff = pointer.seen ? Math.max(0, 1 - Math.hypot(dx, dy) / config.radius) : 0;
        const x = step(item.sx, clamp(dx * falloff * config.pull));
        const y = step(item.sy, clamp(dy * falloff * config.pull));
        if (Math.abs(x) < .05 && Math.abs(y) < .05) {
          if (item.written) { item.el.style.translate = ''; item.written = false; }
          continue;
        }
        item.el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        item.written = true;
      }
    });
    return () => items.forEach(item => { item.el.style.translate = ''; });
  };

  const off = () => {
    stop();
    layers.length = 0;
    while (teardowns.length) teardowns.pop()();
  };

  const init = () => {
    if (reduce.matches) return;
    /* the fullstack track already runs its own WebGL scene: no second field */
    if (CONFIG.field.on && document.documentElement.dataset.role !== 'fullstack') {
      teardowns.push(field({ ...CONFIG.field, max: coarse.matches ? 18 : CONFIG.field.max }));
    }
    if (CONFIG.lens.on && !coarse.matches) teardowns.push(lens(CONFIG.lens));
    if (CONFIG.magnet.on && !coarse.matches) teardowns.push(magnet(CONFIG.magnet));
    start();
  };

  reduce.addEventListener('change', () => { off(); init(); });
  window.FX = { config: CONFIG, off, on: init };
  init();
})();
