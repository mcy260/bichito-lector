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
const oscuroSB = document.getElementById("oscuroSB");
const tituloFilm = document.getElementById("tituloFilm");
const ctaFilm = document.getElementById("ctaFilm");
const caps = [0, 1, 2, 3].map((i) => document.getElementById("cap" + i));

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

  // TEASER "El plan": comedia de misión imposible en 5 beats.
  // 1 vacaciones · 2 el problema · 3 flash: un plan · 4 bueno… varios planes · 5 placa y corte.

  // la escena de la duda/idea no participa del teaser
  scC.style.opacity = "0";

  // --- Beat 1 · el cuarto: se vienen las vacaciones (0 a .26)
  scA.style.opacity = 1 - seg(p, 0.20, 0.26);
  svgSA.style.transform = `scale(${1.08 - 0.06 * seg(p, 0, 0.22)})`;

  // --- Beats 2 y 4 · el estante, la valija y la mano de mamá
  scB.style.opacity = Math.min(seg(p, 0.20, 0.26), Math.max(1 - seg(p, 0.38, 0.47), seg(p, 0.56, 0.65)));
  const q1 = seg(p, 0.60, 0.68);   // se desliza a la valija
  const q3 = seg(p, 0.78, 0.85);   // la mano la agarra y la levanta
  const manoY = lerp(lerp(-420, 240, seg(p, 0.70, 0.77)), -330, q3);
  manoSB.setAttribute("transform", `translate(-268, ${manoY})`);
  // durante el levantamiento, la bufanda cuelga de la mano (mismo desplazamiento)
  const sx = lerp(lerp(-240, 0, q1), 24, q3);
  const sy = q3 > 0 ? manoY - 185 : lerp(-230, 60, q1);
  const srot = lerp(lerp(-4, 14, q1), -2, q3);
  sandSB.setAttribute("transform", `translate(${sx}, ${sy}) rotate(${srot} 672 508)`);
  oscuroSB.style.opacity = String(0.9 * seg(p, 0.86, 0.93));

  // --- Beat 3 · el sueño de la playa, en fundido suave (.38 a .65)
  scE.style.opacity = Math.min(seg(p, 0.38, 0.47), 1 - seg(p, 0.56, 0.65));
  svgSE.style.transform = `scale(${1.08 - 0.06 * seg(p, 0.40, 0.62)})`;

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
