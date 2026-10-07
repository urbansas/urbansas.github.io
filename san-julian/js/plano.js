// La ficha de un lote de San Julián Urbano (lo que se ve al tocar un lote en la foto, en el plano o en la lista) y el
// selector entre la foto real y el plano.
//
// El servidor ya dejó las dos vistas armadas (src/lib/plano-san-julian.js): cada lote es un enlace con su etapa, su número,
// su área y su estado en atributos data-*, y el disponible lleva en el href su mensaje de WhatsApp. Acá no hay
// datos propios: este módulo solo copia eso a un <dialog>. Sin JavaScript, o en un navegador sin <dialog>, los
// disponibles siguen siendo enlaces directos a WhatsApp y nada se rompe.

// Lo que muestra la ficha. El botón de WhatsApp es solo del disponible, aunque llegue un enlace de más.
export function construirFicha({ etapa, lote, area, estado, whatsapp }) {
  const disponible = estado === 'disponible';
  return {
    titulo: `Etapa ${etapa} · Lote ${lote}`,
    estadoTexto: disponible ? 'Disponible' : 'Vendido',
    areaTexto: area || null,
    disponible,
    whatsapp: disponible ? whatsapp ?? null : null
  };
}

// Qué vista queda a la vista y cuál oculta: una sola. Las vistas ocultas llevan `hidden`, así sus enlaces no se anuncian
// ni se enfocan con el teclado, y el botón de la vista activa es el único con aria-pressed="true".
export function estadoDeVistas(activa, nombres) {
  if (!nombres.includes(activa)) throw new Error(`No hay una vista «${activa}»`);
  return nombres.map(nombre => ({ nombre, oculta: nombre !== activa, presionado: nombre === activa }));
}

// El selector llega oculto del servidor (sin JavaScript no haría nada); acá se muestra y se engancha.
export function montarSelector(raiz = document) {
  const caja = raiz.querySelector('[data-selector-vista]');
  if (!caja) return;
  const botones = [...caja.querySelectorAll('button[data-vista]')];
  const vistas = new Map([...raiz.querySelectorAll('[data-vista-lote]')].map(v => [v.getAttribute('data-vista-lote'), v]));
  const nombres = botones.map(b => b.getAttribute('data-vista')).filter(n => vistas.has(n));
  if (nombres.length < 2) return;   // sin las dos vistas el selector no sirve: se queda oculto y se ve lo que haya

  function mostrar(activa) {
    for (const e of estadoDeVistas(activa, nombres)) vistas.get(e.nombre).hidden = e.oculta;
    for (const b of botones) b.setAttribute('aria-pressed', String(b.getAttribute('data-vista') === activa));
  }
  for (const b of botones) b.addEventListener('click', () => mostrar(b.getAttribute('data-vista')));
  caja.hidden = false;
}

export function montarPlano(raiz = document) {
  const dialogo = raiz.getElementById('ficha-lote');
  if (!dialogo || typeof dialogo.showModal !== 'function') return;
  const campo = (s) => dialogo.querySelector(s);

  function abrir(el) {
    const f = construirFicha({ ...el.dataset, whatsapp: el.getAttribute('href') });
    campo('.ficha-titulo').textContent = f.titulo;
    const estado = campo('.ficha-estado');
    estado.textContent = f.estadoTexto;
    estado.setAttribute('data-estado', f.disponible ? 'disponible' : 'vendido');
    campo('.ficha-area').textContent = f.areaTexto ?? '';
    campo('.ficha-area-fila').hidden = f.areaTexto === null;
    const wa = campo('.ficha-whatsapp');
    wa.hidden = !f.whatsapp;
    if (f.whatsapp) wa.setAttribute('href', f.whatsapp); else wa.removeAttribute('href');
    dialogo.showModal();
  }

  for (const el of raiz.querySelectorAll('[data-ficha]')) {
    // Un enlace que abre una ficha se anuncia como botón; el vendido no es enlace y se queda como lo dejó el servidor.
    if (el.hasAttribute('href')) {
      el.setAttribute('role', 'button');
      el.setAttribute('aria-haspopup', 'dialog');
      el.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } });
    }
    el.addEventListener('click', (e) => { e.preventDefault(); abrir(el); });
  }
  // Un toque en el fondo oscuro cierra la ficha.
  dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
}
