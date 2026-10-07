// La ficha de un lote del plano de San Julián Urbano: lo que se ve al tocar un lote en el plano o en la lista.
//
// El servidor ya dejó el plano armado (src/lib/plano-san-julian.js): cada lote es un enlace con su etapa, su número,
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
