// Calculadora del plan de pagos de Karmela. Todo va en millones de pesos y el
// precio se mueve dentro del rango ya publicado (redondeado), nunca sobre el
// precio de un apartamento: la página no muestra precios por unidad.
//
// El mismo módulo lo usa la construcción (para escribir el resultado inicial,
// que se ve aunque el navegador no corra JavaScript) y el navegador.

const MILLONES = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });
export const millones = (m) => `$${MILLONES.format(m)} millones`;

// anticipo + cuotas mensuales durante la obra; lo que falte se paga al terminarla.
// Si la cuota alcanza para pagarlo todo antes, dice en cuántas cuotas y no deja saldo.
export function calcularPlan({ precio, cuota, anticipo, cuotaMinima, meses }) {
  const c = Math.max(cuota, cuotaMinima);
  const falta = precio - anticipo;
  const terminaAntes = c * meses >= falta;
  const cuotas = terminaAntes ? Math.ceil(falta / c) : meses;
  const totalCuotas = terminaAntes ? falta : c * meses;
  const pagadoObra = anticipo + totalCuotas;
  return {
    precio, anticipo, cuota: c, cuotas, totalCuotas, pagadoObra,
    saldo: precio - pagadoObra,
    porcentaje: Math.round((pagadoObra / precio) * 100),
    terminaAntes
  };
}

// Las frases del resultado. Una sola fuente para la construcción y el navegador.
export function frases(r) {
  const filas = [
    ['Anticipo', millones(r.anticipo)],
    [r.terminaAntes ? `${r.cuotas} cuotas mensuales` : `${r.cuotas} cuotas mensuales de ${millones(r.cuota)}`, millones(r.totalCuotas)],
    ['Saldo al terminar la obra', r.saldo > 0 ? millones(r.saldo) : 'Sin saldo']
  ];
  const resumen = r.terminaAntes
    ? `Con cuotas de ${millones(r.cuota)} terminaría de pagarlo en unos ${r.cuotas} meses, sin saldo al final.`
    : `Durante la obra pagaría el ${r.porcentaje} % del apartamento. El resto lo puede pagar con crédito hipotecario.`;
  return { filas, resumen };
}

const mensaje = (r) => `Hola, vi en la página de Urban el proyecto Edificio Karmela. Hice la cuenta con un apartamento de ${millones(r.precio)} y cuotas de ${millones(r.cuota)} al mes. Quiero saber qué apartamentos me sirven.`;

export function montarCalculadora(caja) {
  const d = caja.dataset;
  const plan = { anticipo: Number(d.anticipo), cuotaMinima: Number(d.cuotaMinima), meses: Number(d.meses) };
  const precio = caja.querySelector('[name="precio"]'), cuota = caja.querySelector('[name="cuota"]');
  const verPrecio = caja.querySelector('[data-ver="precio"]'), verCuota = caja.querySelector('[data-ver="cuota"]');
  const tabla = caja.querySelector('.plan-filas'), resumen = caja.querySelector('.plan-resumen');
  const enlace = caja.querySelector('.plan-whatsapp');
  const actualizar = () => {
    const r = calcularPlan({ precio: Number(precio.value), cuota: Number(cuota.value), ...plan });
    verPrecio.textContent = millones(r.precio);
    verCuota.textContent = millones(r.cuota);
    const f = frases(r);
    tabla.replaceChildren(...f.filas.map(([que, cuanto]) => {
      const fila = document.createElement('div');
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = que; dd.textContent = cuanto;
      fila.append(dt, dd);
      return fila;
    }));
    resumen.textContent = f.resumen;
    const u = new URL(enlace.href);
    u.searchParams.set('text', mensaje(r));
    enlace.href = u.toString();
  };
  precio.addEventListener('input', actualizar);
  cuota.addEventListener('input', actualizar);
  actualizar();
}
