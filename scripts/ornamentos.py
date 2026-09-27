# -*- coding: utf-8 -*-
"""
Recorta piezas sueltas del marco del carrusel para poder animarlas aparte.

Por qué del marco y no del `marco_princesa.png`
-----------------------------------------------
`marco_princesa.png` es RGB sin alfa: cualquier recorte suyo sale con un
rectángulo de fondo pegado. `marco_carruselFotos.png` sí trae alfa —46 %
del archivo es transparente— así que sus rosas de esquina se pueden
recortar con el borde real, no con una caja.

Qué sale de aquí
----------------
Cuatro racimos de rosas, uno por esquina. Cada uno se guarda con su
posición en fracciones del marco, de modo que al montarlo encima queda
EXACTAMENTE sobre el sitio del que salió. Eso es lo que permite animarlos
sin que se note el hueco: mientras el marco siga teniendo sus rosas
pintadas, la copia se mueve un par de píxeles sobre su propio original.
Cuando exista el marco sin rosas, la misma capa admite amplitud grande
sin tocar nada más que `MARCO_FOTO.marco` y `ROSAS.amplitud`.

Los recortes se solapan con la cortina y el castillo a propósito: son
rectángulos, no siluetas. Montados en su sitio no se ven; usados como
adorno suelto hay que elegirlos entre los que casi no llevan cortina.
"""

from PIL import Image
from collections import deque
import json
import os

import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARCO = os.path.join(RAIZ, 'public', 'recursos', 'tema', 'marco-foto.webp')
DESTINO = os.path.join(RAIZ, 'public', 'recursos', 'tema')

# (nombre, x0, y0, x1, y1) en fracciones del marco
PIEZAS = [
    ('rosa-si', 0.000, 0.000, 0.190, 0.225),   # superior izquierda
    ('rosa-sd', 0.815, 0.020, 1.000, 0.235),   # superior derecha
    ('rosa-ii', 0.000, 0.655, 0.245, 1.000),   # inferior izquierda
    ('rosa-id', 0.685, 0.690, 1.000, 1.000),   # inferior derecha
]

CALIDAD = 88

# Cuántos pétalos sueltos exportar, de mayor a menor.
PETALOS = 6
# Los pétalos se guardan al doble de su tamaño real. No añade detalle
# —no lo hay—, pero evita que se vean pixelados al mostrarlos a 30 px en
# una pantalla de densidad 2.
ESCALA_PETALO = 2


def sueltos(im):
    """Devuelve las cajas de las piezas con alfa aislado del resto.

    El marco es una sola masa conectada por el borde; lo único que queda
    suelto dentro del hueco son los pétalos que el ilustrador dejó
    flotando. Etiquetarlos por componentes conexas los encuentra sin
    tener que recortarlos a ojo, y salen con su alfa real: no hay que
    inventarles una silueta.
    """
    al = np.asarray(im)[..., 3] > 40
    H, W = al.shape
    visto = np.zeros_like(al)
    cajas = []
    for y0 in range(H):
        for x0 in range(W):
            if not al[y0, x0] or visto[y0, x0]:
                continue
            q = deque([(y0, x0)])
            visto[y0, x0] = True
            xs, ys = [], []
            while q:
                y, x = q.popleft()
                xs.append(x)
                ys.append(y)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and al[ny, nx] and not visto[ny, nx]:
                        visto[ny, nx] = True
                        q.append((ny, nx))
            # La componente 0 es el marco entero; se descarta por tamaño.
            if 60 <= len(xs) <= 4000:
                cajas.append((len(xs), min(xs), min(ys), max(xs) + 1, max(ys) + 1))
    cajas.sort(reverse=True)
    return cajas


def main():
    im = Image.open(MARCO).convert('RGBA')
    W, H = im.size
    meta = {}
    for nombre, x0, y0, x1, y1 in PIEZAS:
        caja = (round(W * x0), round(H * y0), round(W * x1), round(H * y1))
        pieza = im.crop(caja)
        ruta = os.path.join(DESTINO, f'{nombre}.webp')
        pieza.save(ruta, 'WEBP', quality=CALIDAD, method=6, lossless=False)
        meta[nombre] = {
            'left': round(x0 * 100, 3), 'top': round(y0 * 100, 3),
            'width': round((x1 - x0) * 100, 3), 'height': round((y1 - y0) * 100, 3),
        }
        print(f'{nombre:10s} {pieza.width}x{pieza.height:<4d} '
              f'{os.path.getsize(ruta)/1024:5.1f} KB  '
              f'left {x0*100:6.2f}%  top {y0*100:6.2f}%')
    for i, (px, x0, y0, x1, y1) in enumerate(sueltos(im)[:PETALOS], start=1):
        pieza = im.crop((x0, y0, x1, y1))
        pieza = pieza.resize(
            (pieza.width * ESCALA_PETALO, pieza.height * ESCALA_PETALO), Image.LANCZOS)
        ruta = os.path.join(DESTINO, f'petalo-{i}.webp')
        pieza.save(ruta, 'WEBP', quality=CALIDAD, method=6)
        print(f'petalo-{i}   {pieza.width}x{pieza.height:<4d} '
              f'{os.path.getsize(ruta)/1024:5.1f} KB')

    print()
    print(json.dumps(meta, indent=2))


if __name__ == '__main__':
    main()
