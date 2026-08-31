"""
Prepara las fotos del album para el marco del carrusel.

El hueco del marco es casi cuadrado (540x520) y tiene el borde muy difuso.
Una foto cruda ahi dentro se ve como un recorte pegado: el fondo real de la
foto (globos verdes, una pared beige) choca de frente con la escena morada
del marco. El lavado radial —desenfoque y tinte lila hacia el borde— hace
que el fondo de la foto se disuelva en la escena en vez de discutir con ella.
Es la misma receta del retrato de la portada.
"""
from PIL import Image, ImageFilter, ImageEnhance
import math, os

FUENTE = 'public/recursos/cumpleanera'
N = 560           # lado del recorte; el hueco mide 540 px de ancho a 2x

# (archivo, foco vertical 0..1, salida, fuerza del lavado)
#
# La fuerza no es un gusto: depende de lo ruidoso que sea el fondo real.
# La graduación tiene globos verdes y lentejuelas de colores detrás, y el
# verde a media potencia se sigue viendo dentro de una escena morada. Las
# de fondo liso aguantan un lavado suave y conservan más foto.
FOTOS = [
    ('angeles-01.jpg', 0.24, 'album-01.webp', 'fuerte'),   # patio de baldosas
    ('angeles-03.jpg', 0.48, 'album-02.webp', 'medio'),    # escalera
    ('angeles-04.jpg', 0.30, 'album-03.webp', 'fuerte'),   # césped
    ('angeles-02.jpg', 0.26, 'album-04.webp', 'suave'),    # primer plano, fondo liso
    ('angeles-06.jpg', 0.40, 'album-05.webp', 'maximo'),   # globos verdes + lentejuelas
    ('angeles-05.jpg', 0.36, 'album-06.webp', 'medio'),    # pared beige
]

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

CACHE = {}
def capas(nombre):
    if nombre not in CACHE:
        r0, r1, t = LAVADOS[nombre]
        m = radial(N, r0, r1)
        CACHE[nombre] = (m, m.point(lambda v: int(v * t)))
    return CACHE[nombre]

total = 0
for archivo, foco, salida, fuerza in FOTOS:
    MASC, TINTE = capas(fuerza)
    im = Image.open(f'{FUENTE}/{archivo}').convert('RGB')
    W, H = im.size
    lado = min(W, H)
    cx = W // 2
    cy = int(H * foco)
    t = max(0, min(H - lado, cy - lado // 2))
    l = max(0, min(W - lado, cx - lado // 2))
    base = im.crop((l, t, l + lado, t + lado)).resize((N, N), Image.LANCZOS)

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
    print(f'{salida}  {kb:5.0f} KB  (de {archivo}, foco {foco}, lavado {fuerza})')
print(f'TOTAL del album: {total:.0f} KB')
