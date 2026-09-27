"""
Prepara las fotos del album para el marco del carrusel.

El hueco del marco es casi cuadrado (540x520) y tiene el borde muy difuso.
Una foto cruda ahi dentro se ve como un recorte pegado: el fondo real de la
foto (globos verdes, una pared beige) choca de frente con la escena morada
del marco. El lavado radial —desenfoque y tinte lila hacia el borde— hace
que el fondo de la foto se disuelva en la escena en vez de discutir con ella.
Es la misma receta del retrato de la portada.
"""
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageOps
import math, os

FUENTE = 'public/recursos/cumpleanera'
N = 560           # lado del recorte; el hueco mide 540 px de ancho a 2x

# (archivo, foco vertical 0..1, salida, fuerza del lavado, margen)
#
# La fuerza no es un gusto: depende de lo ruidoso que sea el fondo real.
# La graduación tiene globos verdes y lentejuelas de colores detrás, y el
# verde a media potencia se sigue viendo dentro de una escena morada. Las
# de fondo liso aguantan un lavado suave y conservan más foto.
#
# El margen aleja el encuadre. Es para las fuentes que YA son un primer
# plano cerrado: ahí el recorte cuadrado no puede abrir más —ya toma el
# lado completo— y encima el hueco del marco recorta otra vez, así que la
# cara termina llenando el óvalo entera. Con margen la foto se monta más
# pequeña dentro del lienzo y el borde se rellena con ella misma,
# desenfocada; como esa zona es justo la que se lava, el relleno no se
# lee como relleno.
FOTOS = [
    ('angeles-01.jpg', 0.24, 'album-01.webp', 'fuerte', 0.00),  # patio de baldosas
    ('angeles-03.jpg', 0.48, 'album-02.webp', 'medio',  0.00),  # escalera
    ('angeles-04.jpg', 0.30, 'album-03.webp', 'fuerte', 0.00),  # césped
    ('angeles-02.jpg', 0.26, 'album-04.webp', 'medio',  0.24),  # primer plano cerradísimo
    ('angeles-06.jpg', 0.40, 'album-05.webp', 'maximo', 0.00),  # globos verdes + lentejuelas
    ('angeles-05.jpg', 0.36, 'album-06.webp', 'medio',  0.00),  # pared beige

    # Tanda 2 (2026-09-27). Sexto campo opcional:
    #   caja = (izq, arriba, der, abajo) en px de la fuente, se recorta ANTES
    #          del cuadrado. angeles-15 trae franjas negras de 30 px arriba y
    #          abajo; angeles-12 viene dentro de un corazón con esquinas
    #          blancas y solo el centro (~350 px) está limpio, medido.
    #   cx   = foco horizontal 0..1 para las fuentes apaisadas.
    ('angeles-08.jpg', 0.36, 'album-07.webp', 'maximo', 0.00),  # piscina de pelotas
    ('angeles-09.jpg', 0.40, 'album-08.webp', 'medio',  0.00),  # pared lisa
    ('angeles-10.jpg', 0.60, 'album-09.webp', 'maximo', 0.00),  # árbol de Navidad
    ('angeles-11.jpg', 0.28, 'album-10.webp', 'medio',  0.00),  # sala
    ('angeles-12.jpg', 0.50, 'album-11.webp', 'fuerte', 0.00, {'caja': (165, 88, 485, 408)}),  # corazón
    ('angeles-13.jpg', 0.32, 'album-12.webp', 'medio',  0.00),  # auto
    ('angeles-14.jpg', 0.30, 'album-13.webp', 'fuerte', 0.00),  # comedor
    ('angeles-15.jpg', 0.50, 'album-14.webp', 'medio',  0.00, {'caja': (0, 30, 1080, 840), 'cx': 0.36}),  # selfi con franjas
    ('angeles-07.jpg', 0.24, 'album-15.webp', 'medio',  0.00),  # maquillaje de baile
    ('angeles-16.jpg', 0.50, 'album-16.webp', 'medio',  0.00, {'cx': 0.5}),  # selfi apaisada
]

# Solo regenera las salidas que se pasen por línea de comandos, si se pasa
# alguna: `python scripts/album.py album-07.webp album-08.webp`.
import sys
SOLO = set(sys.argv[1:])

# (radio donde empieza el lavado, radio donde es total, tinte máximo)
LAVADOS = {
    'suave':  (0.80, 1.10, 0.62),
    'medio':  (0.74, 1.06, 0.72),
    'fuerte': (0.66, 1.00, 0.82),
    'maximo': (0.56, 0.96, 0.90),
}

LILA = (238, 227, 248)

def radial(n, r0, r1):
    m = Image.new('L', (n, n)); px = m.load(); c = n/2
    for y in range(n):
        dy = y - c
        for x in range(n):
            d = math.hypot(x - c, dy) / c
            v = 0.0 if d <= r0 else min(1.0, (d - r0) / (r1 - r0))
            px[x, y] = int(255 * (v*v*(3-2*v)))
    return m

def alejar(base, margen):
    """Monta `base` reducida dentro de un lienzo N×N para alejar el encuadre.

    Es para las fuentes que ya son un primer plano cerradísimo: ahí el
    recorte cuadrado no puede abrir más —ya toma el lado completo— así que
    la única forma de dar aire es montar la foto más pequeña y rellenar el
    borde.

    Dos detalles que costaron un intento cada uno:

    - El relleno es la MISMA foto ampliada y desenfocada, sin retocarle el
      brillo. Un relleno plano, o uno un punto más claro, deja el montaje
      recortado como una calcomanía.
    - La transición es una ELIPSE muy difuminada, no un rectángulo. Con
      borde recto se ve la caja del montaje aunque esté difuminada, porque
      una línea recta en una foto no existe y el ojo la encuentra sola.
      La elipse además coincide con la forma del hueco del marco.

    El hueco extra no se reparte a partes iguales: 62 % arriba. Estas
    fotos son selfis en contrapicado y el aire va sobre la cabeza.
    """
    if margen <= 0:
        return base
    lado = round(N * (1 - margen))
    hueco = N - lado
    dy = round(hueco * 0.62)
    dx = hueco // 2
    cx, cy = dx + lado / 2, dy + lado / 2
    rx = ry = lado / 2

    fondo = base.filter(ImageFilter.GaussianBlur(30))

    mascara = Image.new('L', (N, N), 0)
    ImageDraw.Draw(mascara).ellipse(
        [cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    mascara = mascara.filter(ImageFilter.GaussianBlur(round(hueco * 0.55)))

    frente = Image.new('RGB', (N, N))
    frente.paste(base.resize((lado, lado), Image.LANCZOS), (dx, dy))
    return Image.composite(frente, fondo, mascara)


CACHE = {}
def capas(nombre):
    if nombre not in CACHE:
        r0, r1, t = LAVADOS[nombre]
        m = radial(N, r0, r1)
        CACHE[nombre] = (m, m.point(lambda v: int(v * t)))
    return CACHE[nombre]

total = 0
for archivo, foco, salida, fuerza, margen, *extra in FOTOS:
    if SOLO and salida not in SOLO:
        continue
    opc = extra[0] if extra else {}
    MASC, TINTE = capas(fuerza)
    im = ImageOps.exif_transpose(Image.open(f'{FUENTE}/{archivo}')).convert('RGB')
    if 'caja' in opc:
        im = im.crop(opc['caja'])
    W, H = im.size
    lado = min(W, H)
    cx = int(W * opc.get('cx', 0.5))
    cy = int(H * foco)
    t = max(0, min(H - lado, cy - lado // 2))
    l = max(0, min(W - lado, cx - lado // 2))
    base = im.crop((l, t, l + lado, t + lado)).resize((N, N), Image.LANCZOS)
    base = alejar(base, margen)

    out = Image.composite(base.filter(ImageFilter.GaussianBlur(13)), base, MASC)
    out = Image.composite(Image.new('RGB', (N, N), LILA), out, TINTE)
    out = ImageEnhance.Color(out).enhance(1.06)
    out = ImageEnhance.Brightness(out).enhance(1.02)

    ruta = f'{FUENTE}/{salida}'
    for q in (78, 70, 62):
        out.save(ruta, 'WEBP', quality=q, method=6)
        kb = os.path.getsize(ruta) / 1024
        if kb < 60: break
    total += kb
    print(f'{salida}  {kb:5.0f} KB  (de {archivo}, foco {foco}, '
          f'lavado {fuerza}, margen {margen})')
print(f'TOTAL del album: {total:.0f} KB')
