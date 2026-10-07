const MILES = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export function metros(n) {
  return MILES.format(Math.round(n)) + ' m²';
}
