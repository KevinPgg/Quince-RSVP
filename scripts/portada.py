# -*- coding: utf-8 -*-
"""
Genera los tres recursos de la portada a pantalla completa a partir del
marco ilustrado original.

Por qué tres archivos y no uno solo
-----------------------------------
`marco_princesa.png` es cuadrado y es un MARCO: el borde lleva la corona,
las cortinas, las borlas, el conejo y el castillo, y el centro es crema
limpia. Un `cover` a formato vertical se come justamente los bordes, que
son lo que hace reconocible la escena. Y una sola imagen vertical larga
obliga a elegir una proporción, que nunca coincide con la del teléfono
real (0.46 en un iPhone 15, 0.56 en un Android de 640).

La solución es un 3-slice vertical:

  banda superior   0 .. CORTE      corona, cortinas, borlas, rosas de arriba
  tira central     (extruida)      se estira por CSS hasta llenar el hueco
  banda inferior   CORTE .. 1      péndulo, castillo, conejo, pájaro, rosas

La tira central es la fila del corte extruida verticalmente. Eso tiene
dos propiedades que ninguna otra opción da:

  1. No hay costura POR CONSTRUCCIÓN. La primera fila de la tira es la
     última de la banda superior y la última es la primera de la inferior,
     porque las tres salen de la misma fila promediada.
  2. Se adapta a cualquier alto de pantalla sin recortar nada. Las dos
     bandas van a su alto natural y la tira absorbe la diferencia.

Una cortina colgando es un degradado vertical: extruir una fila da tela
lisa, no un manchón. Por eso la fila del corte se elige donde no cruza
ningún objeto con forma propia.

Elección de CORTE = 0.43
------------------------
Medido sobre el archivo, no a ojo:

  corona ................ y  2 .. 20 %
  borla izquierda ....... y 24 .. 40 %
  borla derecha ......... y 28 .. 42 %
  péndulo de corazón .... y 43 .. 48 %
  cúpula de oro izq ..... y 44 .. 62 %
  torres del castillo ... y 47 .. 88 %
  conejo ................ y 65 .. 95 %

y = 43 % es la única franja donde no hay nada: las dos borlas ya
terminaron y el péndulo, la cúpula y el castillo todavía no empiezan. Lo
único que cruza es la cadena de oro, que es una línea vertical y se
extruye sin que se note.

Si se cambia el archivo del marco hay que volver a medir estas franjas.
Mover CORTE a ojo parte una borla o un castillo por la mitad.
"""

from PIL import Image
import numpy as np
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, 'PLAN-DESIGN', 'originales', 'marco_princesa.png')
DESTINO = os.path.join(RAIZ, 'public', 'recursos', 'tema')

ANCHO = 1160          # el mismo del marco-cabecera actual
CORTE = 0.43
PROMEDIO = 9          # filas promediadas para sacar la fila de la tira
FUNDIDO = 26          # filas de cada banda que se funden hacia esa fila
TIRA_ALTO = 6         # la tira se estira por CSS; con 6 filas sobra
CALIDAD = 84


def main():
    im = Image.open(ORIGEN).convert('RGB')
    escala = ANCHO / im.width
    im = im.resize((ANCHO, round(im.height * escala)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    alto = a.shape[0]
    corte = round(alto * CORTE)

    # Fila del corte: promedio de unas pocas filas para que el ruido del
    # render no se convierta en rayas verticales al extruirla.
    fila = a[corte - PROMEDIO // 2: corte + PROMEDIO // 2 + 1].mean(axis=0)

    # Las dos bandas se funden hacia esa fila en sus últimas/primeras
    # filas. Sin esto quedaría un salto de un par de niveles justo en la
    # unión, que en una cortina lisa se ve como una línea.
    sup = a[:corte].copy()
    peso = np.linspace(0, 1, FUNDIDO)[:, None, None]
    sup[-FUNDIDO:] = sup[-FUNDIDO:] * (1 - peso) + fila[None] * peso

    inf = a[corte:].copy()
    peso = np.linspace(1, 0, FUNDIDO)[:, None, None]
    inf[:FUNDIDO] = inf[:FUNDIDO] * (1 - peso) + fila[None] * peso

    tira = np.repeat(fila[None], TIRA_ALTO, axis=0)

    salidas = [
        ('portada-superior.webp', sup),
        ('portada-inferior.webp', inf),
        ('portada-medio.webp', tira),
    ]
    for nombre, arr in salidas:
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        ruta = os.path.join(DESTINO, nombre)
        img.save(ruta, 'WEBP', quality=CALIDAD, method=6)
        print(f'{nombre:26s} {img.width}x{img.height:<5d} '
              f'{os.path.getsize(ruta) / 1024:6.1f} KB')


if __name__ == '__main__':
    main()
