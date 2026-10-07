// Visor 360° del inicio. La página carga solo la portada (una foto); Pannellum
// y la esfera entran cuando el visitante toca «Mover la vista», para que el
// inicio siga cargando rápido en celular. Pannellum es el mismo que usa la
// vitrina de Balcones (/balcones/vendor/).
let pannellum = null;

function cargarPannellum() {
  if (pannellum) return pannellum;
  pannellum = new Promise((listo, falla) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/balcones/vendor/pannellum.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = '/balcones/vendor/pannellum.js';
    js.onload = listo;
    js.onerror = () => { pannellum = null; falla(new Error('No se pudo cargar el visor 360°')); };
    document.head.appendChild(js);
  });
  return pannellum;
}

export function montar360(caja) {
  const boton = caja.querySelector('.visor360-abrir');
  boton.addEventListener('click', async () => {
    boton.disabled = true;
    boton.textContent = 'Cargando la vista…';
    try {
      await cargarPannellum();
    } catch {
      boton.disabled = false;
      boton.textContent = 'No cargó. Toque para intentar otra vez';
      return;
    }
    const lienzo = document.createElement('div');
    lienzo.className = 'visor360-lienzo';
    caja.replaceChildren(lienzo);
    window.pannellum.viewer(lienzo, {
      type: 'equirectangular',
      panorama: caja.dataset.pano,
      autoLoad: true,
      yaw: Number(caja.dataset.yaw ?? 0),
      pitch: Number(caja.dataset.pitch ?? 0),
      hfov: 100,
      autoRotate: -2,
      autoRotateInactivityDelay: 6000,
      showControls: true,
      compass: false,
      strings: { loadingLabel: 'Cargando…' }
    });
  });
}
