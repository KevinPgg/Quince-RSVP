"""
Paso 1 de 2 para pasar el álbum del repo a Supabase Storage.

Corre donde haya PIL (no necesita red):
    python scripts/migrar-album.py

Toma los ORIGINALES angeles-*.jpg —no los album-*.webp, que ya traen
el lavado de album.py y con el lavado en CSS quedarían lavados dos
veces— y los deja en 3:4, que es la forma del espejo, en
scripts/_migracion/. El encuadre sale de los mismos parámetros que
usaba album.py (foco vertical, caja, cx, margen), así que ninguna
foto pierde la cabeza al pasar de cuadrado a óvalo vertical.

Después: node scripts/migrar-album.mjs   (paso 2, desde Windows).
"""
from PIL import Image, ImageOps, ImageFilter, ImageDraw
import json, os

FUENTE = 'public/recursos/cumpleanera'
SALIDA = 'scripts/_migracion'
ANCHO, ALTO = 900, 1200

# album-XX -> (fuente, foco vertical, margen, opciones). Copiado de album.py.
PARAMS = {
    'album-01.webp': ('angeles-01.jpg', 0.24, 0.00, {}),
    'album-02.webp': ('angeles-03.jpg', 0.48, 0.00, {}),
    'album-03.webp': ('angeles-04.jpg', 0.30, 0.00, {}),
    'album-04.webp': ('angeles-02.jpg', 0.26, 0.00, {}),  # sin margen: en 3:4 ya entra casi entera
    'album-05.webp': ('angeles-06.jpg', 0.40, 0.00, {}),
    'album-06.webp': ('angeles-05.jpg', 0.36, 0.00, {}),
    'album-07.webp': ('angeles-08.jpg', 0.36, 0.00, {}),
    'album-08.webp': ('angeles-09.jpg', 0.40, 0.00, {}),
    'album-09.webp': ('angeles-10.jpg', 0.60, 0.00, {}),
    'album-10.webp': ('angeles-11.jpg', 0.28, 0.00, {}),
    'album-11.webp': ('angeles-12.jpg', 0.50, 0.00, {'caja': (205, 118, 445, 438)}),  # más adentro: la muesca blanca del corazón asomaba arriba
    'album-12.webp': ('angeles-13.jpg', 0.32, 0.00, {}),
    'album-13.webp': ('angeles-14.jpg', 0.30, 0.00, {}),
    'album-14.webp': ('angeles-15.jpg', 0.50, 0.00, {'caja': (0, 30, 1080, 840), 'cx': 0.36}),
    'album-15.webp': ('angeles-07.jpg', 0.24, 0.00, {}),
    'album-16.webp': ('angeles-16.jpg', 0.50, 0.00, {'cx': 0.5}),
}

# Orden, alt y pie: los mismos de config/galeria.ts (ALBUM).
ALBUM = [
    ('album-07.webp', 'Ángeles de bebé en la piscina de pelotas', 'Los primeros años'),
    ('album-08.webp', 'Ángeles de niña con vestido a rayas rosas', ''),
    ('album-09.webp', 'Ángeles de niña frente al árbol de Navidad', 'Navidades'),
    ('album-11.webp', 'Ángeles de niña con vestido de flores', ''),
    ('album-13.webp', 'Ángeles de niña con gafas de sol y scooter', ''),
    ('album-01.webp', 'Ángeles de niña, en su patineta', ''),
    ('album-02.webp', 'Ángeles de niña con un gorro de vaquita', ''),
    ('album-10.webp', 'Ángeles de niña con vestido rojo de lunares', ''),
    ('album-12.webp', 'Ángeles de niña con blusa naranja', ''),
    ('album-03.webp', 'Ángeles de vestido blanco en el jardín', 'Un día de fiesta'),
    ('album-04.webp', 'Ángeles sonriendo de cerca', ''),
    ('album-05.webp', 'Ángeles el día de su graduación', 'La graduación'),
    ('album-14.webp', 'Ángeles tomándose una selfi', ''),
    ('album-15.webp', 'Ángeles maquillada para una presentación', 'En el escenario'),
    ('album-16.webp', 'Ángeles con blusa vino', ''),
    ('album-06.webp', 'Ángeles hoy', 'Y ahora, quince'),
]

R = ANCHO / ALTO

def a_vertical(im, foco, cx):
    w, h = im.size
    if w / h > R:                      # más ancha que 3:4: recorta los lados
        nw = round(h * R)
        x = round(min(max(cx * w - nw / 2, 0), w - nw))
        return im.crop((x, 0, x + nw, h))
    nh = round(w / R)                  # más alta: recorta arriba/abajo en el foco
    y = round(min(max(foco * h - nh / 2, 0), h - nh))
    return im.crop((0, y, w, y + nh))

def alejar(im, margen):
    """Primer plano cerradísimo: se monta más pequeña y el borde se rellena
    con la misma foto desenfocada, con transición elíptica (ver album.py)."""
    W, H = im.size
    fondo = im.filter(ImageFilter.GaussianBlur(30))
    lw, lh = round(W * (1 - margen)), round(H * (1 - margen))
    dx, dy = (W - lw) // 2, round((H - lh) * 0.62)
    # La elipse va metida dentro del recuadro pegado: si el difuminado
    # de la máscara llega al borde del recuadro, se ve su arista recta.
    b = round((W - lw) * 0.32)
    masc = Image.new('L', (W, H), 0)
    ImageDraw.Draw(masc).ellipse([dx + b, dy + b, dx + lw - b, dy + lh - b], fill=255)
    masc = masc.filter(ImageFilter.GaussianBlur(b * 0.8))
    frente = fondo.copy()
    frente.paste(im.resize((lw, lh), Image.LANCZOS), (dx, dy))
    return Image.composite(frente, fondo, masc)

os.makedirs(SALIDA, exist_ok=True)
manifiesto = []
for orden, (album, alt, pie) in enumerate(ALBUM, start=1):
    fuente, foco, margen, opc = PARAMS[album]
    im = ImageOps.exif_transpose(Image.open(f'{FUENTE}/{fuente}')).convert('RGB')
    if 'caja' in opc:
        im = im.crop(opc['caja'])
    im = a_vertical(im, foco, opc.get('cx', 0.5))
    if margen > 0:
        im = alejar(im, margen)
    if im.width > ANCHO:
        im = im.resize((ANCHO, ALTO), Image.LANCZOS)
    nombre = f'{orden:02d}.webp'
    im.save(f'{SALIDA}/{nombre}', 'WEBP', quality=82, method=6)
    kb = os.path.getsize(f'{SALIDA}/{nombre}') // 1024
    manifiesto.append({'archivo': nombre, 'alt': alt, 'pie': pie or None, 'orden': orden,
                       'ancho': im.width, 'alto': im.height})
    print(f'{nombre}  {fuente:16s} {im.width}x{im.height}  {kb} KB')

with open(f'{SALIDA}/manifiesto.json', 'w', encoding='utf-8') as f:
    json.dump(manifiesto, f, ensure_ascii=False, indent=2)
print('Listo. Ahora: node scripts/migrar-album.mjs')
