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
const svgCC = document.getElementById("svgCC");
const cajaL = document.getElementById("cajaL");
const cajaR = document.getElementById("cajaR");
const luzC = document.getElementById("luzC");
const manoC = document.getElementById("manoC");
const oscuroC = document.getElementById("oscuroC");
const ojosAbiertosC = document.getElementById("ojosAbiertosC");
const ojosCerradosC = document.getElementById("ojosCerradosC");
const scD = document.getElementById("scD");
const cordD = document.getElementById("cordD");
const grisD = document.getElementById("grisD");
const hiloD = document.getElementById("hiloD");
const inigoD = document.getElementById("inigoD");
const amigaD1 = document.getElementById("amigaD1");
const amigaD2 = document.getElementById("amigaD2");
const scrollHint = document.getElementById("scrollHint");
const ctaFilm = document.getElementById("ctaFilm");
const tituloFilm = document.getElementById("tituloFilm");
const caps = [0, 1, 2, 3].map((i) => document.getElementById("cap" + i));

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

  // TEASER "La caja": nunca se explica quién es ni su historia.
  // 1 la caja · 2 algo espera · 3 flash del sueño · 4 alguien se acercó · 5 título y corte.

  // el taller y la vidriera no participan del teaser
  scA.style.opacity = "0";
  scB.style.opacity = "0";

  // --- El depósito (todo el teaser, salvo el flash)
  scC.style.opacity = Math.max(1 - seg(p, 0.42, 0.47), seg(p, 0.58, 0.63));
  // la cámara se acerca despacio a la caja
  svgCC.style.transformOrigin = "62% 62%";
  svgCC.style.transform = `scale(${1 + 0.12 * seg(p, 0.04, 0.40)})`;
  // la caja tiembla cuando alguien se acerca (nunca se abre)
  let tiembla = 0;
  if (p > 0.72 && p < 0.86) {
    tiembla = Math.sin(p * 800) * 4 * Math.sin(((p - 0.72) / 0.14) * Math.PI);
  }
  cajaL.setAttribute("transform", `translate(${tiembla * 0.6}, 0)`);
  cajaR.setAttribute("transform", `translate(${tiembla}, 0)`);
  luzC.style.opacity = String(0.8 * seg(p, 0.64, 0.78));
  ojosCerradosC.style.opacity = "1";
  ojosAbiertosC.style.opacity = "0";
  manoC.setAttribute("transform", "translate(520, 30)");
  oscuroC.style.opacity = String(0.9 * seg(p, 0.86, 0.93));

  // --- El flash del sueño (.42 a .63): un suspiro de colores y nubes
  scD.style.opacity = Math.min(seg(p, 0.42, 0.47), 1 - seg(p, 0.58, 0.63));
  const q = seg(p, 0.43, 0.62);
  const pos = vueloPos(q);
  const rot = 16 * Math.sin(q * Math.PI * 3);
  const escala = 1 - 0.22 * q;
  cordD.setAttribute("transform", `translate(${pos.x}, ${pos.y}) rotate(${rot}) scale(${escala})`);
  grisD.style.opacity = "0";
  hiloD.style.opacity = "0";
  inigoD.style.opacity = "0";
  amigaD1.style.opacity = "0";
  amigaD2.style.opacity = "0";

  // --- Placa de título y CTA
  const tQ = seg(p, 0.90, 0.945);
  tituloFilm.style.opacity = String(tQ);
  const ctaQ = seg(p, 0.945, 0.98);
  ctaFilm.style.opacity = String(ctaQ);
  ctaFilm.style.pointerEvents = ctaQ > 0.5 ? "auto" : "none";

  // --- Subtítulos
  setCap(caps[0], fade(p, 0.02, 0.17));
  setCap(caps[1], fade(p, 0.22, 0.38));
  setCap(caps[2], fade(p, 0.455, 0.60));
  setCap(caps[3], fade(p, 0.66, 0.85));

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
