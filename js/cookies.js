// Aviso de cookies y píxel de Meta. El píxel solo se carga si el visitante dice que
// sí (decisión del 25-oct-2026: «Con aviso»). La respuesta queda en este navegador;
// el botón «Cookies» del pie la vuelve a preguntar. Sin JavaScript no hay aviso, y
// por eso tampoco va la imagen <noscript> del código de Meta: sería píxel sin permiso.
//
// Eventos: PageView en toda página; ViewContent con el nombre del proyecto en la
// página de cada uno; Contact en cada botón de WhatsApp, con el proyecto, y con
// content_category «calculadora» si sale de la calculadora de Karmela.
(() => {
  const ID = document.currentScript.dataset.pixel;
  const CLAVE = 'urban-cookies';
  const leer = () => { try { return localStorage.getItem(CLAVE); } catch { return null; } };
  const guardar = (v) => { try { localStorage.setItem(CLAVE, v); } catch { /* sin almacenamiento: se vuelve a preguntar en cada página */ } };
  const proyecto = () => document.body.dataset.proyecto;
  let cargado = false;
  let permiso = leer();

  function cargarPixel() {
    if (cargado) { window.fbq('consent', 'grant'); return; }
    cargado = true;
    // Código base de Meta, tal cual.
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', ID);
    window.fbq('track', 'PageView');
    if (proyecto()) window.fbq('track', 'ViewContent', { content_name: proyecto() });
  }

  // Rechazar después de haber aceptado: el píxel deja de mandar y se borra su cookie.
  function apagarPixel() {
    if (cargado) window.fbq('consent', 'revoke');
    const dominio = location.hostname.replace(/^www\./, '');
    for (const d of ['', `; domain=.${dominio}`]) document.cookie = `_fbp=; Max-Age=0; path=/${d}`;
  }

  function decidir(si) {
    permiso = si ? 'si' : 'no';
    guardar(permiso);
    document.querySelector('.aviso-cookies')?.remove();
    if (si) cargarPixel(); else apagarPixel();
  }

  function aviso() {
    if (document.querySelector('.aviso-cookies')) return;
    const caja = document.createElement('div');
    caja.className = 'aviso-cookies';
    caja.setAttribute('role', 'region');
    caja.setAttribute('aria-label', 'Cookies');
    caja.innerHTML = '<p>Si nos deja, usamos el píxel de Meta (Facebook e Instagram) para saber qué anuncios traen visitas a la página y mostrarle los nuestros. Si no, la página funciona igual. <a href="/privacidad/">Más información</a></p>'
      + '<div><button type="button" data-cookies="si">Aceptar</button><button type="button" data-cookies="no">Rechazar</button></div>';
    caja.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cookies]');
      if (b) decidir(b.dataset.cookies === 'si');
    });
    document.body.append(caja);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="https://wa.me/"]');
    if (!a || !cargado || permiso !== 'si') return;
    const datos = { content_name: proyecto() || 'Urban S.A.S.' };
    if (a.classList.contains('plan-whatsapp')) datos.content_category = 'calculadora';
    window.fbq('track', 'Contact', datos);
  });

  if (permiso === 'si') cargarPixel();
  else if (permiso !== 'no') aviso();
  const boton = document.querySelector('.cambiar-cookies');
  if (boton) { boton.hidden = false; boton.addEventListener('click', aviso); }
})();
