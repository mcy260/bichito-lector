// ===== Bichito Lector · scrollytelling cinematográfico =====
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
// progreso local: 0 antes de `a`, 1 después de `b`
const seg = (p, a, b) => clamp01((p - a) / (b - a));
// visible entre `a` y `b` con fundido de entrada/salida
const fade = (p, a, b, f = 0.03) => Math.min(seg(p, a, a + f), 1 - seg(p, b - f, b));

// ---------- Hilo rojo ----------
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
const svgA = document.getElementById("svgA");
const sunA = document.getElementById("sunA");
const moonA = document.getElementById("moonA");
const winsA = document.getElementById("winsA");
const nightVeil = document.getElementById("nightVeil");
const scB = document.getElementById("scB");
const svgB = document.getElementById("svgB");
const suspects = document.getElementById("suspects");
const scC = document.getElementById("scC");
const molly = document.getElementById("molly");
const mollyCan = document.getElementById("mollyCan");
const lupaLight = document.getElementById("lupaLight");
const lupaRing = document.getElementById("lupaRing");
const scD = document.getElementById("scD");
const svgD = document.getElementById("svgD");
const canD = document.getElementById("canD");
const canLines = document.getElementById("canLines");
const dust = document.getElementById("dust");
const scrollHint = document.getElementById("scrollHint");
const caps = [0, 1, 2, 3, 4, 5].map((i) => document.getElementById("cap" + i));

// huellitas que cruzan la pantalla (de abajo-izquierda hacia el farol)
const PAW_TRAIL = [
  { x: 8, y: 82, r: 30 }, { x: 18, y: 74, r: 34 }, { x: 27, y: 78, r: 38 },
  { x: 37, y: 68, r: 42 }, { x: 47, y: 71, r: 46 }, { x: 57, y: 60, r: 50 },
  { x: 67, y: 62, r: 55 }, { x: 76, y: 50, r: 58 },
];
const pawsBox = document.getElementById("paws");
const pawEls = PAW_TRAIL.map((pt) => {
  const el = document.createElement("div");
  el.className = "paw";
  el.style.left = pt.x + "%";
  el.style.top = pt.y + "%";
  el.style.setProperty("--pr", pt.r + "deg");
  el.innerHTML = '<svg viewBox="0 0 40 40"><g fill="#F5D876" opacity=".92"><ellipse cx="20" cy="27" rx="9" ry="7"/><circle cx="9" cy="17" r="4"/><circle cx="19" cy="13" r="4.2"/><circle cx="29" cy="17" r="4"/></g></svg>';
  pawsBox.appendChild(el);
  return el;
});

// recorrido de la lupa por la escena (en % de pantalla); termina sobre el sospechoso,
// cuya posición aparente depende del recorte de la imagen según el ancho de pantalla
function getLupaPath() {
  const end = window.innerWidth < 720 ? { x: 68, y: 70 } : { x: 56, y: 70 };
  return [{ x: 20, y: 62 }, { x: 44, y: 26 }, { x: 74, y: 40 }, end];
}

function lupaPoint(t) {
  const path = getLupaPath();
  const n = path.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const local = t * n - i;
  const a = path[i];
  const b = path[i + 1];
  const e = local * local * (3 - 2 * local); // suavizado
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

  // fuera de la sección: no gastar trabajo
  if (rect.top > window.innerHeight || rect.bottom < 0) return;

  // --- Escena A · Gatópolis feliz → anochece (0 a .26)
  scA.style.opacity = 1 - seg(p, 0.24, 0.30);
  const aZoom = seg(p, 0, 0.26);
  svgA.style.transform = `scale(${1.1 - 0.08 * aZoom})`;
  const nightQ = seg(p, 0.09, 0.22);
  sunA.setAttribute("cy", String(170 + 620 * nightQ));           // el sol se pone
  moonA.setAttribute("transform", `translate(0, ${330 * nightQ})`); // la luna sube
  winsA.style.opacity = nightQ;                                   // las ventanas se encienden
  nightVeil.style.opacity = nightQ * 0.72;

  // --- Escena B · zoom hacia Lady Patitas mientras los sospechosos cruzan (.24 a .53)
  scB.style.opacity = Math.min(seg(p, 0.24, 0.30), 1 - seg(p, 0.48, 0.53));
  svgB.style.transformOrigin = window.innerWidth < 720 ? "80% 66%" : "60% 62%";
  svgB.style.transform = `scale(${1 + 0.24 * seg(p, 0.26, 0.50)})`;
  suspects.setAttribute("transform", `translate(${140 + 760 * seg(p, 0.27, 0.50)}, 0)`);

  // --- Huellas (.42 a .56): aparecen una a una
  pawEls.forEach((el, i) => {
    const t = 0.42 + i * 0.016;
    const on = seg(p, t, t + 0.02) * (1 - seg(p, 0.56, 0.60));
    el.style.opacity = on * 0.95;
    el.style.transform = `scale(${0.4 + 0.6 * on}) rotate(var(--pr))`;
  });

  // --- Escena C · el Dr. Molly camina al farol y la lupa lo busca (.47 a .79)
  scC.style.opacity = Math.min(seg(p, 0.47, 0.53), 1 - seg(p, 0.74, 0.79));
  // Molly entra desde la izquierda hasta el farol (coordenadas del viewBox 1440x900)
  const mollyX = 180 + 620 * seg(p, 0.49, 0.63);
  molly.setAttribute("transform", `translate(${mollyX}, 0)`);
  // al llegar, esconde la lata bajo el saco
  mollyCan.style.opacity = String(1 - seg(p, 0.63, 0.66));
  // la lupa recorre la escena y termina sobre él
  const q = seg(p, 0.54, 0.72);
  const pt = lupaPoint(q);
  const vmin = Math.min(window.innerWidth, window.innerHeight);
  const grow = Math.min(seg(p, 0.52, 0.57), 1 - seg(p, 0.72, 0.755));
  const r = vmin * (0.13 + 0.03 * Math.sin(q * Math.PI)) * grow;
  lupaLight.style.opacity = grow * 0.95;
  lupaLight.style.left = pt.x + "%";
  lupaLight.style.top = pt.y + "%";
  lupaLight.style.width = r * 2.6 + "px";
  lupaLight.style.height = r * 2.6 + "px";
  lupaRing.style.opacity = grow;
  lupaRing.style.left = pt.x + "%";
  lupaRing.style.top = pt.y + "%";
  lupaRing.style.width = r * 2 + "px";
  lupaRing.style.height = r * 2 + "px";

  // --- Escena D · la lata cae, rebota y levanta polvo (.74 a 1)
  scD.style.opacity = seg(p, 0.74, 0.79);
  const fall = seg(p, 0.76, 0.875);
  const bounce = seg(p, 0.875, 0.945);
  let canY;
  if (fall < 1) {
    canY = -820 + 820 * fall * fall; // caída acelerada
  } else {
    canY = -170 * Math.sin(bounce * Math.PI) * (1 - bounce * 0.55); // rebote que se apaga
  }
  const squash = fall >= 1 && bounce < 0.18 ? 1 - 0.12 * Math.sin((bounce / 0.18) * Math.PI) : 1;
  canD.style.transform = `translateY(${canY}px) scaleY(${squash})`;
  canLines.style.opacity = String(0.8 * (1 - seg(p, 0.86, 0.885)));
  const dustQ = fade(p, 0.875, 0.97, 0.02);
  dust.style.opacity = String(dustQ * 0.8);
  dust.style.transform = `translateY(${-26 * seg(p, 0.875, 0.93)}px) scale(${1 + 0.5 * seg(p, 0.875, 0.95)})`;
  let shakeX = 0;
  if (p > 0.873 && p < 0.905) {
    shakeX = Math.sin(p * 900) * 8 * (1 - seg(p, 0.873, 0.905));
  }
  svgD.style.transform = `translateX(${shakeX}px)`;

  // --- Subtítulos
  setCap(caps[0], fade(p, 0.015, 0.115));
  setCap(caps[1], fade(p, 0.13, 0.24));
  setCap(caps[2], fade(p, 0.32, 0.47));
  setCap(caps[3], fade(p, 0.56, 0.73));
  setCap(caps[4], fade(p, 0.80, 0.885));
  setCap(caps[5], fade(p, 0.90, 1.02));

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

// ---------- Catálogo dinámico (data/libros.json, se edita desde admin.html) ----------
async function renderCatalogo() {
  try {
    const res = await fetch("data/libros.json?v=" + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data.libros) || data.libros.length === 0) return;
    const cont = document.querySelector(".cards");
    if (!cont) return;
    cont.innerHTML = "";

    const badge = (texto, extra) => {
      const s = document.createElement("span");
      s.className = "badge" + (extra ? " " + extra : "");
      s.textContent = texto;
      return s;
    };

    data.libros.forEach((libro) => {
      const art = document.createElement("article");
      art.className = "card reveal";

      const imgWrap = document.createElement("div");
      imgWrap.className = "card-img";
      if (libro.portada) {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.src = libro.portada;
        img.alt = "Portada de " + libro.titulo + ".";
        imgWrap.appendChild(img);
      }

      const body = document.createElement("div");
      body.className = "card-body";
      const h3 = document.createElement("h3");
      h3.textContent = libro.titulo;
      const p = document.createElement("p");
      p.textContent = libro.descripcion || "";
      const badges = document.createElement("div");
      badges.className = "badges";
      if (libro.edad) badges.appendChild(badge(libro.edad, "badge-age"));
      (libro.idiomas || []).forEach((i) => badges.appendChild(badge(i)));
      if (libro.audiolibro) badges.appendChild(badge("Audiolibro", "badge-audio"));
      body.append(h3, p, badges);

      if (libro.link) {
        const a = document.createElement("a");
        a.className = "card-link";
        a.href = libro.link;
        const externo = /^https?:/i.test(libro.link);
        if (externo) {
          a.target = "_blank";
          a.rel = "noopener";
        }
        a.textContent = /amazon\./i.test(libro.link) ? "Ver en Amazon →" : (externo ? "Ver el libro →" : "Viví la historia →");
        body.appendChild(a);
      }

      art.append(imgWrap, body);
      cont.appendChild(art);
      observer.observe(art);
    });

    const soon = document.createElement("article");
    soon.className = "card card-soon reveal";
    soon.innerHTML = '<div class="card-img card-img-soon"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="34" r="20" fill="none" stroke="#C9A876" stroke-width="6"/><line x1="54" y1="50" x2="68" y2="66" stroke="#C9A876" stroke-width="8" stroke-linecap="round"/></svg></div><div class="card-body"><h3>Próximo caso…</h3><p>La colección de Bichito Lector sigue creciendo con nuevas historias ilustradas.</p><div class="badges"><span class="badge badge-soon">Próximamente</span></div></div>';
    cont.appendChild(soon);
    observer.observe(soon);
  } catch (e) {
    /* sin datos: queda el catálogo estático del HTML */
  }
}

renderCatalogo();

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

// debug: ?film=0.6 posiciona la película en ese progreso (para capturas)
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

// el layout cambia a medida que cada imagen carga: recalcular el hilo
document.querySelectorAll("img").forEach((img) => {
  if (!img.complete) {
    img.addEventListener("load", scheduleRebuild, { once: true });
    img.addEventListener("error", scheduleRebuild, { once: true });
  }
});

boot();
