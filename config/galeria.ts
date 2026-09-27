// ============================================================
//  Álbum de la página principal.
//
//  Se edita aquí y no en la base a propósito: las fotos viven en
//  el repo, así que su lista es código. Añadir una es copiar el
//  archivo a public/recursos/cumpleanera/ y agregar un renglón.
//
//  Las fotos ya vienen recortadas a cuadrado y con el fondo
//  difuminado hacia el borde: las genera scripts/album.py a partir
//  de los originales en angeles-*.jpg. El difuminado no es adorno,
//  es lo que evita que el fondo real de la foto choque con la
//  escena morada del marco.
// ============================================================

export type FotoAlbum = {
  src: string
  alt: string
  /** Pie de foto. Vacío = sin pie. */
  pie?: string
}

export const ALBUM: FotoAlbum[] = [
  { src: '/recursos/cumpleanera/album-01.webp', alt: 'Ángeles de niña, en su patineta', pie: 'Los primeros años' },
  { src: '/recursos/cumpleanera/album-02.webp', alt: 'Ángeles de niña con un gorro de vaquita', pie: '' },
  { src: '/recursos/cumpleanera/album-03.webp', alt: 'Ángeles de vestido blanco en el jardín', pie: 'Un día de fiesta' },
  { src: '/recursos/cumpleanera/album-04.webp', alt: 'Ángeles sonriendo de cerca', pie: '' },
  { src: '/recursos/cumpleanera/album-05.webp', alt: 'Ángeles el día de su graduación', pie: 'La graduación' },
  { src: '/recursos/cumpleanera/album-06.webp', alt: 'Ángeles hoy', pie: 'Y ahora, quince' },
]

// ============================================================
//  Geometría del marco del carrusel, medida sobre el archivo.
//
//  El hueco no se aproxima con una elipse: la foto se recorta con
//  `mask-image` usando el canal alfa del propio marco, así que
//  encaja exacto y no asoma por los bordes difusos.
// ============================================================
export const MARCO_FOTO = {
  marco: '/recursos/tema/marco-foto.webp',
  mascara: '/recursos/tema/marco-foto-mascara.png',
  /** ancho / alto del marco recortado */
  proporcion: 620 / 711,
  /** Posición del hueco, en % del marco. */
  hueco: { left: '6.05%', top: '0%', width: '87.11%', height: '73.17%' },
  /**
   * Poner en `true` cuando `marco` apunte a la versión SIN rosas.
   *
   * Mientras sea `false` las rosas de `ROSAS` se montan justo encima de
   * las que el marco ya trae pintadas, así que solo pueden moverse un par
   * de píxeles: más y asoma el original por debajo. Con el marco limpio la
   * misma capa pasa a amplitud grande sin tocar nada más.
   */
  sinRosas: false,
} as const

// ============================================================
//  Piezas sueltas recortadas del marco (scripts/ornamentos.py).
//
//  Las rosas van con la posición EXACTA de la que salieron, en % del
//  marco, para que al montarlas encima queden sobre su propio sitio.
//  `origen` es el punto por el que pivotan: el rabillo de donde cuelga
//  el racimo, no su centro, o al girar se despegan de la esquina.
// ============================================================

export type RosaMarco = {
  src: string
  left: string
  top: string
  width: string
  origen: string
  /** 0 a 3; desfasa el vaivén para que no respiren a la vez. */
  fase: 0 | 1 | 2 | 3
}

export const ROSAS: RosaMarco[] = [
  { src: '/recursos/tema/rosa-si.webp', left: '0%',     top: '0%',    width: '19%',   origen: '100% 100%', fase: 0 },
  { src: '/recursos/tema/rosa-sd.webp', left: '81.5%',  top: '2%',    width: '18.5%', origen: '0% 100%',   fase: 2 },
  { src: '/recursos/tema/rosa-ii.webp', left: '0%',     top: '65.5%', width: '24.5%', origen: '100% 0%',   fase: 1 },
  { src: '/recursos/tema/rosa-id.webp', left: '68.5%',  top: '69%',   width: '31.5%', origen: '0% 0%',     fase: 3 },
]

/**
 * Pétalos sueltos del marco, con su alfa real.
 *
 * Salen de las componentes conexas aisladas dentro del hueco: son los
 * pétalos que el ilustrador dejó flotando, así que no hay que inventarles
 * una silueta ni aproximar un recorte. El 5 quedó descartado a mano
 * porque arrastra una esquina de cortina morada.
 */
export const PETALOS = [
  '/recursos/tema/petalo-1.webp',
  '/recursos/tema/petalo-2.webp',
  '/recursos/tema/petalo-3.webp',
  '/recursos/tema/petalo-4.webp',
  '/recursos/tema/petalo-6.webp',
] as const

// ============================================================
//  Ilustración vertical larga de fondo (opcional).
//
//  Poner en null la apaga. Mientras no exista el archivo, la página
//  se queda con el degradado y el mosaico de pétalos, que ya cubren
//  todo el alto del scroll.
//
//  Formato: 1080 px de ancho por 3500-4500 de alto, AVIF o WebP,
//  bajo 250 KB. Más ancho no sirve —se muestra al 100 % del
//  contenedor— y más peso se nota en datos móviles, que es como la
//  mayoría va a abrir el link desde WhatsApp.
// ============================================================

export type Ilustracion = { src: string; opacidad: number }

export const ILUSTRACION_LARGA: Ilustracion | null = null
// export const ILUSTRACION_LARGA: Ilustracion | null = {
//   src: '/recursos/tema/fondo-largo.webp',
//   opacidad: 0.32,
// }
