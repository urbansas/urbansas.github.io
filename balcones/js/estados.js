import { idLote } from './inventario.js';

// Desde el 24-nov-2026 el estado de cada lote lo manda la app de ventas de
// Balcones, que usan los socios y el asesor de Urban. La página se construye con
// el estado que había al publicar y, al abrirse, le pregunta a la app el de hoy.
//
// La app solo contesta `{ id, estado }` con los tres estados públicos: un lote
// bloqueado o separado por un socio sale «reservado», y uno en promesa,
// escriturado o en especie sale «vendido». Ni nombres, ni precios, ni clientes.
//
// Va en un módulo aparte y no dentro de inventario.js a propósito: GitHub Pages
// deja los módulos diez minutos en la caché del navegador, sin sello de versión.
// Un archivo nuevo no puede estar en la caché vieja de nadie.
export const URL_ESTADOS = 'https://ventas.urbansas.com.co/api/estados';

const PUBLICOS = new Set(['disponible', 'reservado', 'vendido']);

// Pone encima del inventario construido lo que diga la app. Devuelve una copia:
// el inventario que recibe no se toca. Lo que no se entienda se ignora, y un lote
// que la app no traiga se queda como estaba.
//
// El lote en especie es la excepción: la app lo da «vendido» porque de cara al
// público no se distinguen, pero la página lo nombra aparte (no se vendió, se
// entregó como pago). Si la app lo devuelve a disponible, sí se aplica.
export function aplicarEstados(inv, estados) {
  if (!Array.isArray(estados)) return { inv, cambiados: 0 };
  const porId = new Map();
  for (const e of estados) {
    if (e && typeof e.id === 'string' && PUBLICOS.has(e.estado)) porId.set(e.id, e.estado);
  }
  let cambiados = 0;
  const lotes = inv.lotes.map((l) => {
    const nuevo = porId.get(idLote(l));
    if (!nuevo || nuevo === l.estado) return l;
    if (l.estado === 'especie' && nuevo === 'vendido') return l;
    cambiados++;
    return { ...l, estado: nuevo };
  });
  return { inv: { ...inv, lotes }, cambiados };
}

// Le pide los estados a la app. Si no contesta en `ms` milisegundos, contesta
// con error o manda algo que no es JSON, devuelve null y la página se queda con
// lo construido. No manda cookies: la app no necesita saber quién mira.
export async function pedirEstados(url = URL_ESTADOS, ms = 3000, pedir = fetch) {
  const corte = new AbortController();
  const reloj = setTimeout(() => corte.abort(), ms);
  try {
    const r = await pedir(url, { signal: corte.signal, credentials: 'omit' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(reloj);
  }
}
