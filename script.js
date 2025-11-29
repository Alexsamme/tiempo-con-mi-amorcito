/* script.js completo: contadores (detallado), corazones, album, visor y audio por foto */

/* ---------- FECHAS ---------- */
// Fecha de inicio como enamorados: 29 octubre 2023 00:00:00
const FECHA_ENAMORADOS = new Date("October 29, 2023 00:00:00").getTime();
// Como esposos: por definir (mostramos texto "Por definir")
const FECHA_ESPOSOS = null;

/* ---------- MUURI (opcional) ----------
   No es obligatorio para que funcione, pero si quieres usar Muuri,
   ya no lo inicializo aquí para evitar dependencias; en caso de querer
   animación de layout, puedes incluir Muuri y crear `grid = new Muuri(".grid")`.
*/

/* ---------- CONTADOR DETALLADO (años, meses, días, h, m, s) ---------- */
function diferenciaCompleta(startDate, endDate) {
  // startDate, endDate son objetos Date
  let y1 = startDate.getFullYear(), m1 = startDate.getMonth(), d1 = startDate.getDate();
  let h1 = startDate.getHours(), min1 = startDate.getMinutes(), s1 = startDate.getSeconds();

  let y2 = endDate.getFullYear(), m2 = endDate.getMonth(), d2 = endDate.getDate();
  let h2 = endDate.getHours(), min2 = endDate.getMinutes(), s2 = endDate.getSeconds();

  let years = y2 - y1;
  let months = m2 - m1;
  let days = d2 - d1;
  let hours = h2 - h1;
  let minutes = min2 - min1;
  let seconds = s2 - s1;

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) {
    // retroceder un mes en endDate para calcular días
    const prevMonth = new Date(y2, m2, 0); // último día del mes anterior
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }

  return { years, months, days, hours, minutes, seconds };
}

function actualizarContadores() {
  const ahora = new Date();
  const inicio = new Date(FECHA_ENAMORADOS);
  const diff = diferenciaCompleta(inicio, ahora);
  const enamText = `${diff.years} años, ${diff.months} meses, ${diff.days} días, ${diff.hours}h ${diff.minutes}m ${diff.seconds}s`;
  const elEnam = document.getElementById("contador-enamorados");
  if (elEnam) elEnam.textContent = enamText;

  const elEsp = document.getElementById("contador-esposos");
  if (!FECHA_ESPOSOS) {
    if (elEsp) elEsp.textContent = "Por definir";
  } else {
    const diff2 = diferenciaCompleta(new Date(FECHA_ESPOSOS), ahora);
    if (elEsp) elEsp.textContent = `${diff2.years} años, ${diff2.months} meses, ${diff2.days} días, ${diff2.hours}h ${diff2.minutes}m ${diff2.seconds}s`;
  }
}
setInterval(actualizarContadores, 1000);
actualizarContadores();

/* ---------- CORAZONES FLOTANDO ---------- */
const contCor = document.getElementById("corazones-container");
function crearCorazon(){
  const c = document.createElement("div");
  c.className = "corazon";
  c.textContent = Math.random() > 0.5 ? "💜" : "💛";
  c.style.left = (Math.random() * 100) + "%";
  c.style.fontSize = (12 + Math.random() * 30) + "px";
  c.style.animationDuration = (4 + Math.random() * 6) + "s";
  c.style.opacity = (0.5 + Math.random() * 0.5);
  contCor.appendChild(c);
  // eliminar después del tiempo de animación
  setTimeout(()=> {
    if (c && c.parentNode) c.parentNode.removeChild(c);
  }, 11000);
}
setInterval(crearCorazon, 420);

/* ---------- AUDIO (una sola pista a la vez) ---------- */
let pistaActiva = null; // elemento Audio
let tipoPista = null;   // "foto" o "boda"
let bodaAudio = null;

function detenerPistaActual() {
  if (pistaActiva) {
    try { pistaActiva.pause(); pistaActiva.currentTime = 0; } catch (e) {}
    pistaActiva = null;
    tipoPista = null;
  }
}

/* BOTÓN BODA */
const btnBoda = document.getElementById("btn-boda");
if (btnBoda) {
  btnBoda.addEventListener("click", (e) => {
    // detener pista de foto si está sonando
    if (tipoPista === "foto") detenerPistaActual();

    if (!bodaAudio) {
      bodaAudio = new Audio(encodeURI("musica/boda.mp3"));
      bodaAudio.loop = true;
    }

    if (tipoPista === "boda" && pistaActiva && !pistaActiva.paused) {
      bodaAudio.pause();
      detenerPistaActual();
      btnBoda.textContent = "Reproducir boda (boda.mp3)";
    } else {
      detenerPistaActual();
      pistaActiva = bodaAudio;
      tipoPista = "boda";
      bodaAudio.play().catch(()=>{ /* autoplay bloqueado si no hay interacción */ });
      btnBoda.textContent = "Pausar boda";
    }
  });
}

/* ---------- ABRIR ÁLBUM (botón) ---------- */
const verFotos = document.getElementById("verFotos");
const portada = document.getElementById("portada");
const album = document.getElementById("album");

if (verFotos) {
  verFotos.addEventListener("click", (e) => {
    e.preventDefault();
    portada.classList.add("oculto");
    if (album) {
      album.classList.remove("oculto");
      album.setAttribute("aria-hidden","false");
    }
    // refrescar layout simple: forzar repaint
    setTimeout(()=> { window.dispatchEvent(new Event('resize')); }, 150);
  });
}

/* ---------- VISOR (lightbox) y reproducción por foto ---------- */
const suponer = document.getElementById("suponer");
const suponerImg = document.getElementById("suponer-img");
const suponerDesc = document.getElementById("suponer-desc");
const btnCerrar = document.getElementById("btn-cerrar");

document.querySelectorAll(".grid .item").forEach(item => {
  item.addEventListener("click", () => {
    const imgEl = item.querySelector("img");
    const src = imgEl ? imgEl.src : "";
    const desc = item.dataset.descripcion || "";
    const audioFile = item.dataset.audio || null;

    // detener cualquier audio previo
    detenerPistaActual();

    // mostrar visor
    if (suponerImg) suponerImg.src = src;
    if (suponerDesc) suponerDesc.textContent = desc;
    if (suponer) {
      suponer.classList.add("activo");
      suponer.setAttribute("aria-hidden","false");
    }

    // reproducir audio asociado si existe (click del usuario es la interacción)
    if (audioFile) {
      const ruta = "musica/" + audioFile;
      try {
        const audio = new Audio(encodeURI(ruta));
        pistaActiva = audio;
        tipoPista = "foto";
        audio.play().catch(()=>{ /* si falla, no bloquear */ });
      } catch (err) {
        console.warn("Error audio", audioFile, err);
      }
    }
  });
});

/* cerrar visor: botón, clic fuera o ESC */
function cerrarVisor(){
  if (suponer) {
    suponer.classList.remove("activo");
    suponer.setAttribute("aria-hidden","true");
  }
  if (tipoPista === "foto") detenerPistaActual();
}
if (btnCerrar) btnCerrar.addEventListener("click", cerrarVisor);
if (suponer) suponer.addEventListener("click", (e)=> { if (e.target === suponer) cerrarVisor(); });
window.addEventListener("keydown", (e)=> { if (e.key === "Escape") cerrarVisor(); });

/* ---------- FIN script.js ---------- */
