// ===== Sandrita · el scroll son los pasitos =====
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const fade = (p, a, b, f = 0.03) => Math.min(seg(p, a, a + f), 1 - seg(p, b - f, b));

// ---------- Hilo de lana ----------
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
const svgSA = document.getElementById("svgSA");
const scB = document.getElementById("scB");
const sandSB = document.getElementById("sandSB");
const manoSB = document.getElementById("manoSB");
const scC = document.getElementById("scC");
const sandTristeC = document.getElementById("sandTristeC");
const ideaC = document.getElementById("ideaC");
const sandAbrazoC = document.getElementById("sandAbrazoC");
const oscuroSC = document.getElementById("oscuroSC");
const scE = document.getElementById("scE");
const svgSE = document.getElementById("svgSE");
// en el sueño la playa se muestra vacía, esperándolos (sin spoiler)
["pomponSE", "anitaSE", "castilloSE"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.style.opacity = "0";
});
const scrollHint = document.getElementById("scrollHint");
const caps = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("cap" + i));

const lerp = (a, b, t) => a + (b - a) * t;

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

  // --- Escena A · la misión (0 a .26)
  scA.style.opacity = 1 - seg(p, 0.20, 0.26);
  svgSA.style.transform = `scale(${1.08 - 0.06 * seg(p, 0, 0.22)})`;

  // --- Escena E · EL SUEÑO de la playa (.20 a .44): la sombrilla espera vacía
  scE.style.opacity = Math.min(seg(p, 0.20, 0.26), 1 - seg(p, 0.38, 0.44));
  svgSE.style.transform = `scale(${1.08 - 0.06 * seg(p, 0.22, 0.42)})`;

  // --- Escena B · el plan y la mano de mamá (.38 a .66)
  scB.style.opacity = Math.min(seg(p, 0.38, 0.44), 1 - seg(p, 0.60, 0.66));
  const q1 = seg(p, 0.44, 0.51);   // se desliza a la valija
  const q3 = seg(p, 0.575, 0.63);  // la mano la levanta
  const sx = lerp(lerp(-240, 0, q1), 40, q3);
  const sy = lerp(lerp(-230, 60, q1), -260, q3);
  const srot = lerp(lerp(-4, 14, q1), -6, q3);
  sandSB.setAttribute("transform", `translate(${sx}, ${sy}) rotate(${srot} 672 508)`);
  const manoY = lerp(lerp(-420, 0, seg(p, 0.52, 0.57)), -300, q3);
  manoSB.setAttribute("transform", `translate(0, ${manoY})`);

  // --- Escena C · la duda, la idea… y CORTE (.60 a 1)
  scC.style.opacity = seg(p, 0.60, 0.66);
  const ideaQ = fade(p, 0.83, 0.94, 0.03);
  ideaC.style.opacity = String(ideaQ);
  ideaC.setAttribute("transform", `translate(0, ${-14 * ideaQ})`);
  sandTristeC.style.opacity = "1";
  sandAbrazoC.style.opacity = "0";
  oscuroSC.style.opacity = String(0.85 * seg(p, 0.955, 1.0));

  // --- Subtítulos
  setCap(caps[0], fade(p, 0.02, 0.13));
  setCap(caps[1], fade(p, 0.24, 0.38));
  setCap(caps[2], fade(p, 0.46, 0.58));
  setCap(caps[3], fade(p, 0.67, 0.79));
  setCap(caps[4], fade(p, 0.83, 0.93));
  setCap(caps[5], fade(p, 0.945, 1.05));

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
