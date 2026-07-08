// ===== Cordelia · el scroll es el viento =====
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const fade = (p, a, b, f = 0.03) => Math.min(seg(p, a, a + f), 1 - seg(p, b - f, b));

// ---------- Hilo de la cometa ----------
const threadPath = document.getElementById("threadPath");
const main = document.getElementById("pageMain");
let threadLen = 0;

function buildThread() {
  const pins = [...document.querySelectorAll("[data-pin]")];
  if (pins.length < 2) return;
  const mainTop = main.getBoundingClientRect().top + window.scrollY;
  const pts = pins.map((p) => {
    const r = p.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 + window.scrollX,
      y: r.top + r.height / 2 + window.scrollY - mainTop,
    };
  }).sort((a, b) => a.y - b.y);

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midY = (prev.y + cur.y) / 2;
    const sway = (i % 2 === 0 ? 1 : -1) * Math.min(90, Math.abs(cur.y - prev.y) * 0.18);
    d += ` C ${prev.x + sway} ${midY}, ${cur.x - sway} ${midY}, ${cur.x} ${cur.y}`;
  }
  threadPath.setAttribute("d", d);
  threadLen = threadPath.getTotalLength();
  threadPath.style.strokeDasharray = threadLen;
  updateThread();
}

function updateThread() {
  if (!threadLen) return;
  const doc = document.documentElement;
  const progress = clamp01(window.scrollY / (doc.scrollHeight - window.innerHeight));
  threadPath.style.strokeDashoffset = reduceMotion ? 0 : threadLen * (1 - progress);
}

// ---------- Parallax del hero ----------
const heroBg = document.getElementById("heroBg");
const heroContent = document.getElementById("heroContent");

function updateHero() {
  if (reduceMotion) return;
  const y = window.scrollY;
  const vh = window.innerHeight;
  if (y > vh * 1.2) return;
  heroBg.style.transform = `translateY(${y * 0.35}px)`;
  heroContent.style.transform = `translateY(${y * 0.12}px)`;
  heroContent.style.opacity = String(Math.max(0, 1 - y / (vh * 0.7)));
}

// ---------- La película ----------
const track = document.querySelector(".pelicula");
const scA = document.getElementById("scA");
const svgCA = document.getElementById("svgCA");
const scB = document.getElementById("scB");
const amigas = [1, 2, 3].map((i) => document.getElementById("amiga" + i));
const grisB = document.getElementById("grisB");
const scC = document.getElementById("scC");
const cajaL = document.getElementById("cajaL");
const cajaR = document.getElementById("cajaR");
const luzC = document.getElementById("luzC");
const ojosAbiertosC = document.getElementById("ojosAbiertosC");
const ojosCerradosC = document.getElementById("ojosCerradosC");
const scD = document.getElementById("scD");
const cordD = document.getElementById("cordD");
const grisD = document.getElementById("grisD");
const hiloD = document.getElementById("hiloD");
const amigaD1 = document.getElementById("amigaD1");
const amigaD2 = document.getElementById("amigaD2");
const scrollHint = document.getElementById("scrollHint");
const caps = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("cap" + i));

// recorrido del vuelo (coordenadas del viewBox 1440x900)
const VUELO = [
  { x: 700, y: 990 }, { x: 420, y: 560 }, { x: 950, y: 390 }, { x: 590, y: 260 }, { x: 800, y: 195 },
];

function vueloPos(t) {
  const n = VUELO.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const local = t * n - i;
  const a = VUELO[i];
  const b = VUELO[i + 1];
  const e = local * local * (3 - 2 * local);
  return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
}

function setCap(el, on) {
  el.style.opacity = on;
  el.style.transform = `translate(-50%, ${14 - 14 * Math.min(1, on * 2)}px)`;
}

function updateFilm() {
  if (reduceMotion || !track) return;
  const rect = track.getBoundingClientRect();
  const total = track.offsetHeight - window.innerHeight;
  const p = window.__filmP !== undefined ? window.__filmP : clamp01(-rect.top / total);

  if (rect.top > window.innerHeight || rect.bottom < 0) return;

  // --- Escena A · el taller (0 a .24)
  scA.style.opacity = 1 - seg(p, 0.22, 0.28);
  svgCA.style.transform = `scale(${1.1 - 0.08 * seg(p, 0, 0.24)})`;

  // --- Escena B · la vidriera: las amigas se van, los colores se apagan (.22 a .53)
  scB.style.opacity = Math.min(seg(p, 0.22, 0.28), 1 - seg(p, 0.48, 0.53));
  amigas.forEach((el, i) => {
    const t = 0.29 + i * 0.05;
    const q = seg(p, t, t + 0.05);
    el.setAttribute("transform", `translate(${q * 340}, ${-q * 560})`);
    el.style.opacity = String(1 - q);
  });
  grisB.style.opacity = String(0.6 * seg(p, 0.36, 0.50));

  // --- Escena C · las cajas se apartan, la luz la encuentra (.48 a .75)
  scC.style.opacity = Math.min(seg(p, 0.48, 0.53), 1 - seg(p, 0.70, 0.75));
  const abre = seg(p, 0.54, 0.64);
  cajaL.setAttribute("transform", `translate(${-190 * abre}, 0)`);
  cajaR.setAttribute("transform", `translate(${200 * abre}, 0)`);
  luzC.style.opacity = String(0.8 * seg(p, 0.58, 0.67));
  ojosCerradosC.style.opacity = String(1 - seg(p, 0.665, 0.685));
  ojosAbiertosC.style.opacity = String(seg(p, 0.665, 0.685));

  // --- Escena D · el vuelo: los colores vuelven (.70 a 1)
  scD.style.opacity = seg(p, 0.70, 0.75);
  const q = seg(p, 0.74, 0.97);
  const pos = vueloPos(q);
  const rot = 12 * Math.sin(q * Math.PI * 3) * (1 - q * 0.5);
  const escala = 1 - 0.25 * q;
  cordD.setAttribute("transform", `translate(${pos.x}, ${pos.y}) rotate(${rot}) scale(${escala})`);
  grisD.style.opacity = String(0.55 * (1 - seg(p, 0.76, 0.88)));
  const manoX = 712, manoY = 800;
  const sag = 60 + 80 * (1 - q);
  hiloD.setAttribute("d", `M ${manoX} ${manoY} Q ${(manoX + pos.x) / 2} ${(manoY + pos.y) / 2 + sag} ${pos.x} ${pos.y + 60 * escala}`);
  hiloD.style.opacity = String(0.9 * seg(p, 0.74, 0.78));
  const q1 = seg(p, 0.87, 0.92);
  amigaD1.style.opacity = String(q1);
  amigaD1.setAttribute("transform", `translate(${pos.x + 170 - 40 * q1}, ${pos.y - 90})`);
  const q2 = seg(p, 0.90, 0.95);
  amigaD2.style.opacity = String(q2);
  amigaD2.setAttribute("transform", `translate(${pos.x - 190 + 40 * q2}, ${pos.y - 40})`);

  // --- Subtítulos
  setCap(caps[0], fade(p, 0.02, 0.13));
  setCap(caps[1], fade(p, 0.27, 0.37));
  setCap(caps[2], fade(p, 0.385, 0.49));
  setCap(caps[3], fade(p, 0.55, 0.69));
  setCap(caps[4], fade(p, 0.76, 0.86));
  setCap(caps[5], fade(p, 0.88, 1.02));

  scrollHint.style.opacity = String(1 - seg(p, 0.005, 0.03));
}

// ---------- Loop de scroll ----------
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateHero();
    updateFilm();
    updateThread();
    ticking = false;
  });
}

window.addEventListener("scroll", onScroll, { passive: true });

// ---------- Reveal al entrar en pantalla ----------
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("is-visible");
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- Menú móvil ----------
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") nav.classList.remove("open");
});

// ---------- Arranque ----------
function boot() {
  buildThread();
  updateHero();
  updateFilm();
}

window.addEventListener("load", boot);

// debug: ?film=0.6 congela la película en ese progreso (para capturas)
const dbgFilm = new URLSearchParams(location.search).get("film");
if (dbgFilm !== null) {
  window.__filmP = parseFloat(dbgFilm);
  const gotoFilm = () => {
    document.querySelector(".hero").style.display = "none";
    document.querySelector(".header").style.display = "none";
    track.style.height = "100vh";
    window.scrollTo(0, 0);
    updateFilm();
  };
  gotoFilm();
  window.addEventListener("load", gotoFilm);
  setTimeout(gotoFilm, 250);
  setTimeout(gotoFilm, 900);
}

let rebuildTimer;
function scheduleRebuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(buildThread, 200);
}

window.addEventListener("resize", scheduleRebuild);

document.querySelectorAll("img").forEach((img) => {
  if (!img.complete) {
    img.addEventListener("load", scheduleRebuild, { once: true });
    img.addEventListener("error", scheduleRebuild, { once: true });
  }
});

boot();
