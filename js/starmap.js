// The Heavens: a canvas night sky generated from the same seed as the
// mythology. Constellation geometry lives in normalized coordinates
// (x: 0–1 of width, cluster offsets in fractions of height) so the sky
// survives any resize without regenerating.

import { createRng } from './prng.js';

const BG_STAR_COUNT = 340;
const HOVER_RADIUS = 95;

function generateSky(seed, constellations) {
  const rng = createRng(`${seed}:sky`);

  const stars = Array.from({ length: BG_STAR_COUNT }, () => ({
    x: rng.next(),
    y: rng.next(),
    r: rng.float(0.3, 1.3),
    alpha: rng.float(0.12, 0.7),
    phase: rng.float(0, Math.PI * 2),
    speed: rng.float(0.3, 1.4),
  }));

  // One cell per constellation, so no two clusters collide.
  const cells = rng.shuffle([0, 1, 2, 3, 4, 5]);
  const placed = constellations.map((constellation, i) => {
    const cell = cells[i % cells.length];
    const col = cell % 3;
    const row = Math.floor(cell / 3);
    const cx = (col + rng.float(0.32, 0.68)) / 3;
    const cy = (row + rng.float(0.34, 0.66)) / 2 * 0.82 + 0.06;

    const starCount = rng.int(4, 7);
    const points = [{ du: 0, dv: 0 }];
    for (let s = 1; s < starCount; s += 1) {
      const prev = points[s - 1];
      const angle = rng.float(0, Math.PI * 2);
      const dist = rng.float(0.05, 0.085);
      let du = prev.du + Math.cos(angle) * dist;
      let dv = prev.dv + Math.sin(angle) * dist;
      const mag = Math.hypot(du, dv);
      if (mag > 0.15) {
        du *= 0.15 / mag;
        dv *= 0.15 / mag;
      }
      points.push({ du, dv });
    }

    const edges = [];
    for (let s = 1; s < starCount; s += 1) edges.push([s - 1, s]);
    const branchCount = rng.int(0, Math.min(2, starCount - 3));
    for (let b = 0; b < branchCount; b += 1) {
      const from = rng.int(2, starCount - 1);
      const to = rng.int(0, from - 2);
      if (!edges.some(([a, z]) => (a === to && z === from) || (a === from && z === to))) {
        edges.push([to, from]);
      }
    }

    const radii = points.map(() => rng.float(1.3, 2.4));
    const labelDv = Math.max(...points.map((p) => p.dv)) + 0.055;
    return { ...constellation, cx, cy, points, edges, radii, labelDv };
  });

  return { stars, constellations: placed };
}

function supportsMotion() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createStarmap(canvas, legendEl, mythos) {
  const sky = generateSky(mythos.seed, mythos.constellations);
  const ctx = canvas.getContext('2d');
  const motion = supportsMotion();
  const defaultLegend = legendEl.innerHTML;

  let raf = 0;
  let visible = true;
  let mouse = null;
  let hovered = -1;
  let shooting = null;
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function starXY(c, p) {
    return { x: c.cx * width + p.du * height, y: c.cy * height + p.dv * height };
  }

  function drawBackground(t) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#060a16');
    grad.addColorStop(0.6, '#091022');
    grad.addColorStop(1, '#0b1226');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // A faint galactic band, drawn as a soft diagonal gradient.
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-0.32);
    const band = ctx.createLinearGradient(0, -height * 0.3, 0, height * 0.3);
    band.addColorStop(0, 'rgba(214, 222, 240, 0)');
    band.addColorStop(0.5, 'rgba(214, 222, 240, 0.05)');
    band.addColorStop(1, 'rgba(214, 222, 240, 0)');
    ctx.fillStyle = band;
    ctx.fillRect(-width, -height * 0.3, width * 2, height * 0.6);
    ctx.restore();

    for (const star of sky.stars) {
      const twinkle = motion ? 0.22 * Math.sin(t * 0.001 * star.speed + star.phase) : 0;
      const alpha = Math.max(0.04, Math.min(1, star.alpha + twinkle));
      ctx.fillStyle = `rgba(235, 230, 214, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawShootingStar() {
    if (!motion) return;
    if (!shooting && Math.random() < 1 / 700) {
      shooting = {
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.35,
        vx: 4.2 * (width / 900),
        vy: 1.9 * (width / 900),
        life: 36,
      };
    }
    if (!shooting) return;
    const tail = 9;
    const grad = ctx.createLinearGradient(
      shooting.x, shooting.y,
      shooting.x - shooting.vx * tail, shooting.y - shooting.vy * tail,
    );
    const fade = Math.sin((shooting.life / 36) * Math.PI);
    grad.addColorStop(0, `rgba(240, 235, 220, ${(0.85 * fade).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(240, 235, 220, 0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(shooting.x, shooting.y);
    ctx.lineTo(shooting.x - shooting.vx * tail, shooting.y - shooting.vy * tail);
    ctx.stroke();
    shooting = { ...shooting, x: shooting.x + shooting.vx, y: shooting.y + shooting.vy, life: shooting.life - 1 };
    if (shooting.life <= 0 || shooting.x > width + 60) shooting = null;
  }

  function drawConstellations() {
    ctx.textAlign = 'center';
    try { ctx.letterSpacing = '2.5px'; } catch { /* older engines: tracking is decorative */ }

    sky.constellations.forEach((c, i) => {
      const active = i === hovered;
      const pts = c.points.map((p) => starXY(c, p));

      ctx.strokeStyle = active ? 'rgba(212, 175, 55, 0.85)' : 'rgba(206, 178, 94, 0.32)';
      ctx.lineWidth = 1;
      for (const [a, b] of c.edges) {
        ctx.beginPath();
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
        ctx.stroke();
      }

      pts.forEach((p, s) => {
        const r = c.radii[s] * (active ? 1.25 : 1);
        if (active) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
          glow.addColorStop(0, 'rgba(212, 175, 55, 0.5)');
          glow.addColorStop(1, 'rgba(212, 175, 55, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = active ? 'rgba(244, 228, 188, 1)' : 'rgba(238, 232, 215, 0.92)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.font = '10.5px "EB Garamond", serif';
      ctx.fillStyle = active ? 'rgba(212, 175, 55, 0.95)' : 'rgba(196, 188, 165, 0.55)';
      ctx.fillText(c.name.toUpperCase(), c.cx * width, (c.cy + c.labelDv) * height);
    });
  }

  function nearestConstellation() {
    if (!mouse) return -1;
    let best = -1;
    let bestDist = HOVER_RADIUS;
    sky.constellations.forEach((c, i) => {
      for (const p of c.points) {
        const pos = starXY(c, p);
        const d = Math.hypot(pos.x - mouse.x, pos.y - mouse.y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
    });
    return best;
  }

  function updateLegend() {
    const next = nearestConstellation();
    if (next === hovered) return;
    hovered = next;
    canvas.style.cursor = hovered >= 0 ? 'pointer' : 'default';
    if (hovered >= 0) {
      const c = sky.constellations[hovered];
      legendEl.innerHTML = `<strong>${c.name}.</strong> ${c.legend}`;
      legendEl.classList.add('active');
    } else {
      legendEl.innerHTML = defaultLegend;
      legendEl.classList.remove('active');
    }
  }

  function frame(t) {
    drawBackground(t);
    drawConstellations();
    drawShootingStar();
    if (motion && visible) raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    updateLegend();
    if (!motion) start(); // static mode still re-renders on hover
  };
  const onLeave = () => {
    mouse = null;
    updateLegend();
    if (!motion) start();
  };
  const onResize = () => {
    resize();
    if (!motion) start();
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  window.addEventListener('resize', onResize);

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }, { threshold: 0.05 });
  observer.observe(canvas);

  resize();
  start();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
    },
  };
}
