# Prompts de generación pendientes

Dos archivos por generar. Los dos van a `PLAN-DESIGN/originales/`; de ahí
salen las versiones servidas con los scripts del repo.

## Por qué el marco actual salió cuadrado

El prompt original decía **`vertical 4:5`**. Eso es 0.80 — casi cuadrado.
Un teléfono es 0.46 (iPhone 15) o 0.56 (Android de 640). De ahí viene todo
el problema de la portada: no es que la imagen esté mal, es que se pidió
con una proporción que no es la del dispositivo.

Además el prompt original tenía **`no人物 faces`**: se coló un par de
caracteres chinos («人物» = personas/personajes). Según el modelo, eso
puede ignorarse o puede envenenar el resto de la línea de negativos.
Abajo va limpio.

---

## A. Portada vertical

**Proporción:** 9:16. Midjourney `--ar 9:16`; en modelos con tamaños
fijos, el más alto disponible (1024×1536 sirve; 832×1472 mejor).

No hace falta que la proporción sea exacta. La portada se sigue montando
con el corte en tres bandas de `scripts/portada.py`, que absorbe la
diferencia entre la proporción del archivo y la de la pantalla sin
recortar nada. Con un original ya alto, la parte estirada se reduce
muchísimo — que es justo lo que hoy se ve como columnas de tela.

```
Storybook illustration for a princess party invitation cover. Extremely tall
vertical composition, aspect ratio 9:16.

COMPOSITION — this is the most important instruction: the artwork is a BORDER,
not a scene. A wide, empty, softly glowing warm cream corridor runs vertically
down the entire centre of the image from top to bottom, occupying the middle
45% of the width. Every object sits on the left and right margins or at the
very top and the very bottom. Nothing crosses or enters the centre corridor.

TOP EDGE: heavy purple velvet curtains swagged across the top; a golden tiara
set with a heart shaped amethyst resting on the left side of the swag; clusters
of pink and violet roses in both upper corners; a heart shaped amethyst pendant
on a long gold chain hanging down from the upper right.

LEFT AND RIGHT MARGINS, running the full height: the velvet curtains fall in
long vertical folds all the way down both sides, with gold tassels and gold
filigree vines. Roses and gold leaf sprays punctuate the folds.

BOTTOM: a fairytale castle with lavender and gold spires rising on the right; a
small river valley catching golden hour light at the bottom centre; a white
rabbit with a gold collar sitting among roses on the bottom left; a small
bluebird on the bottom right; banks of pink and magenta roses along the bottom
edge.

THROUGHOUT: floating rose petals, glowing fairy dust and magic sparkles, but
only over the margins, never in the centre corridor.

COLOUR: royal purple, old gold, magenta rose, pale lilac, warm cream centre.
Golden hour sky in soft lilac and rose pink.

STYLE: rich painterly digital art, cinematic soft lighting, warm gold accents,
highly detailed.

NEGATIVE: no text, no letters, no numbers, no watermark, no signature, no
people, no faces, no characters, no objects in the centre of the image, nothing
crossing the middle.
```

Al recibirlo: **no reescalar ni recortar a mano**. Se deja el original tal
cual en `PLAN-DESIGN/originales/` y se vuelven a medir las franjas —dónde
empieza y termina cada objeto— para elegir la altura del corte. Mover el
corte a ojo parte una borla o un castillo por la mitad.

---

## B. Marco del carrusel sin rosas

**Proporción:** 6:7 (la del marco actual es 620/711 = 0.872).

**El punto que hay que entender antes de generar:** los modelos de imagen
**no producen canal alfa**. El hueco transparente del marco actual venía
del archivo de origen, no de un prompt. Por eso el prompt pide el centro
en **verde plano `#00FF00`**: ese verde luego se convierte en
transparencia con el mismo relleno por difusión que ya generó
`marco-foto-mascara.png`. Es la parte fácil; lo que no se puede arreglar
después es un centro con degradado o con brillitos encima.

```
Ornate vertical picture frame for a princess themed photo, portrait
orientation, aspect ratio 6:7.

The frame is a BORDER only. The entire centre — a large rounded opening
occupying about 85% of the width and the top 73% of the height — is filled with
FLAT PURE GREEN #00FF00: completely solid, no shading, no gradient, no
sparkles, no objects, no shadows cast onto it. Nothing overlaps this green
area.

The border itself: deep purple velvet curtains with gold tassels and hanging
amethyst gems along the top and both sides; a fairytale castle with lavender
and gold spires, and a lit golden lantern, in the lower corners; a pale stone
balustrade over a lilac lake at golden hour along the bottom; gold filigree
scrollwork.

CRITICAL: there are absolutely NO flowers anywhere in this image. No roses, no
daisies, no blossoms, no buds, no petals, no floral garlands. The border is
velvet, gold, stone, castle and lake only.

COLOUR: royal purple, old gold, pale lilac, warm golden hour light.
STYLE: rich painterly digital art, warm gold accents, cinematic soft lighting,
highly detailed.

NEGATIVE: no flowers, no roses, no petals, no blossoms, no leaves, no text, no
letters, no people, no faces, no watermark, no border around the image.
```

---

## C. Racimo de rosas suelto — dos o tres variantes

Es lo que se anima encima del marco B. **No se reutilizan los recortes
`rosa-*.webp` actuales**: salen del marco viejo y su geometría no va a
coincidir con la del marco nuevo.

```
A cluster of roses on a completely flat, solid pure green #00FF00 background.
Three or four blooms — one large magenta rose, two pink roses, and a few small
white and pink daisies — with gold edged green leaves, arranged as a corner
garland fanning out from the lower left. Rich painterly digital art, warm
cinematic lighting, highly detailed, purple and gold fairytale palette.

The background must be completely flat solid green with nothing else in it: no
vase, no stems trailing off the edge, no shadow cast on the green, no
vignetting, no text.
```

Con dos variantes basta: la segunda se espeja para la esquina contraria.

---

## Qué pasa cuando lleguen

- **A:** medir franjas, ajustar `CORTE` en `scripts/portada.py`,
  regenerar las tres bandas. `components/Cabecera.tsx` no cambia.
- **B y C:** sacar el alfa del verde, volver a medir el hueco y
  actualizar `MARCO_FOTO` en `config/galeria.ts`; recortar las rosas y
  actualizar `ROSAS`; poner `MARCO_FOTO.sinRosas: true`. La capa animada
  ya está escrita y se enciende con ese booleano.

**El verde deja un fleco verdoso en el borde suave de los pétalos al
sacar el alfa.** Se quita restando el canal verde en la zona
semitransparente; está previsto, no hace falta pedir otro fondo.
