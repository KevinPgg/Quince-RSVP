// Utilidades de color sin dependencias de servidor: las usa el
// carrusel en el navegador y el panel para validar antes de guardar.

const HEX = /^#[0-9a-f]{6}$/i

export function esHex(v: unknown): v is string {
  return typeof v === 'string' && HEX.test(v)
}

export function aRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16)) as [number, number, number]
}

/** Luminancia relativa WCAG, 0 (negro) a 1 (blanco). */
export function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Claridad mínima de un color de fondo del álbum. Con 0.5 el pie en
 * `#b52272` (Great Vibes, 28 px) queda arriba de 3:1, el mínimo AA
 * para texto grande, y el oro de los espejos sigue leyéndose.
 */
export const LUMINANCIA_MINIMA = 0.5

export const MIN_COLORES = 2
export const MAX_COLORES = 6

/** Devuelve el motivo si la paleta no sirve, o null si está bien. */
export function validarPaleta(colores: unknown): string | null {
  if (!Array.isArray(colores)) return 'La paleta no tiene el formato esperado.'
  if (colores.length < MIN_COLORES || colores.length > MAX_COLORES)
    return `La paleta lleva entre ${MIN_COLORES} y ${MAX_COLORES} colores.`
  for (const c of colores) {
    if (!esHex(c)) return 'Hay un color que no es válido.'
    if (luminancia(c) < LUMINANCIA_MINIMA)
      return `${c} es demasiado oscuro: el pie de foto y el oro dejarían de leerse. Elige un tono más claro.`
  }
  return null
}

/** Color en la posición p (0..1) de la paleta, interpolado en RGB. */
export function colorEn(paradas: [number, number, number][], p: number): [number, number, number] {
  if (paradas.length === 1) return paradas[0]
  const x = Math.max(0, Math.min(1, p)) * (paradas.length - 1)
  const i = Math.min(paradas.length - 2, Math.floor(x))
  const t = x - i
  return paradas[i].map((v, k) => Math.round(v + (paradas[i + 1][k] - v) * t)) as [number, number, number]
}
