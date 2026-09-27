# Estado de la entrega «Princesa Sofía» — portada

Actualizado: 2026-08-30. Complementa `plan.md`; donde discrepen, manda este archivo.

## Hecho

- **Paso 1 — `public/`.** Todo en minúscula: `public/recursos/{cumpleanera,tema}/`.
  Las siete fotos son `angeles-01.jpg … angeles-07.jpg`. El renombrado de
  `Recursos` → `recursos` necesitó pasar por un nombre intermedio: NTFS no
  distingue mayúsculas y un `mv` directo no hace nada.
- **Paso 2 — imágenes.** Ya existían, no hubo que generarlas. `castillo.png`
  recomprimido a paleta de 8 colores: 279 KB → 111 KB. `marco_princesa.png`
  (4.9 MB, sin usar) y el `.jfif` duplicado salieron de `public/` a
  `PLAN-DESIGN/originales/`.
- **`retrato.jpg`.** Derivado de `angeles-05.jpg` (la selfie con mejor mirada).
  Recorte cuadrado sobre la cara, desenfoque radial y lavado lila hacia el
  borde para que el fondo beige de la pared no pelee con la paleta. 688 px,
  45 KB. El script está en el historial de la sesión; si hay que rehacerlo,
  los parámetros son centro (650, 430), lado 640, `r0=0.78`, tinte 0.55,
  lavado global 8 %.
- **Paso 3 — paleta.** Los siete tokens de 4b en `:root`. Cuatro familias en el
  `@import`. `--f-titulo` y `--f-firma` añadidas y registradas en
  `tailwind.config.ts` como `font-cinzel` y `font-firma`.
- **Paso 4 — portada.** Reemplazada. `@keyframes destello` en `globals.css`
  dentro del `@media (prefers-reduced-motion: no-preference)`.

## Tres desviaciones del plan, con su razón

1. **El degradado de fondo no va en `body`.** El plan pedía
   `background: linear-gradient(...) fixed`. En Safari iOS ese atajo repinta mal
   al hacer scroll y da saltos. Va en `body::before` con `position: fixed` y
   `z-index: -1`. Mismo resultado visual, sin el bug.
2. **El castillo no usa `fill` ni `object-cover`.** Con un contenedor de altura
   fija (`h-[30%]`), en escritorio queda tan apaisado que `cover` recorta las
   torres y `contain` encoge el castillo a una estampilla en el centro. Va
   anclado al ancho (`w-full h-auto`) con tope de `max-w-2xl`, y una
   `mask-image` que lo disuelve hacia arriba. Eso sustituye al velo degradado
   que el plan ponía encima; ya no hace falta.
3. **El aro de oro tenía una costura.** El `conic-gradient` abría en `#f4e0ae` y
   cerraba en `#c08a2e`, así que a 140° se veía un corte duro. Ahora abre y
   cierra en `#c08a2e`.

El rosa `#b52272` sigue literal en `page.tsx`, como pedía el plan.

---

# Entrega 2 — invitación `/i/[token]` (tableros 5a y 5b)

## Corrección al plan

`plan.md` dice que la invitación está diseñada en **3c**, en oscuro, y que hay
que pasarla a claro. Es falso: el documento trae un tablero **5** —«Invitación
/i/[token] en claro — 3c pasado al lenguaje de 4a»— con `5a` (invitación +
confirmación) y `5b` (gracias) ya en claro. Se implementó ese, no 3c.

## Hecho

- **Héroe de 400 px, no pantalla completa.** El cartucho del saludo se monta
  sobre su borde inferior con `-mt-[26px]` y los dos se leen como una pieza.
  Eso resuelve que `fondo-invitacion.png` sea un marco de 1620 px y la página
  mida más de 4000: solo tiene que cubrir el héroe.
- **`fondo-invitacion.png` ya trae transparencia real** (centro con alpha 0),
  así que los pétalos flotan sobre el degradado sin taparlo. No hubo que
  recortar nada.
- **«XV»** en dos capas: contorno de oro detrás, degradado rosa recortado al
  texto delante.
- **Componentes nuevos:** `components/Filigrana.tsx` (la línea de oro con el
  corazón, compartida por portada, invitación y gracias) y
  `components/Cartucho.tsx` (la tarjeta con marco de oro y remate en arco).
- **Clases nuevas en `globals.css`:** `.boton-morado`, `.boton-rosa`,
  `.boton-tenue`, `.boton-oro`, `.etiqueta-tema`, `.xv-relleno`, `.vaiven`.
  Los botones de la invitación usan Cinzel; el panel sigue con
  `.boton-primario` y `.boton-borde`.
- **RSVP:** el `<select>` de lugares pasó a stepper de –/+ con puntos de oro.
- **Gracias:** relee la respuesta para decir cuántos lugares confirmó, dentro
  de un `try` — si la consulta falla, cae al texto genérico en vez de romper
  una pantalla donde ya se guardó lo importante.

## Tres desviaciones de 5a, con su razón

1. **El «XV» se habría podido volver invisible.** 5a usa
   `-webkit-text-fill-color: transparent` sin guarda: si el navegador no aplica
   `background-clip: text`, el texto desaparece. La clase `.xv-relleno` pone
   un `color` sólido y solo dentro de un `@supports` activa el degradado.
2. **`#9c7a3e` a 10 px no pasa contraste** (~3.9:1 sobre blanco, el mínimo AA
   es 4.5). El «CON CARIÑO PARA» va en `#8a6a33`, que da 4.6:1.
3. **El héroe se topa a `max-w-xl` y el castillo a 420 px.** 5a está dibujado a
   390 px: es una tarjeta. A pantalla completa los pétalos se agrandan un 32 %
   y del castillo solo quedan los muros. Con el tope, en escritorio la
   invitación se lee como tarjeta y en móvil no cambia nada.

El stepper lleva `role="group"`, `aria-label` en los dos botones y un
`aria-live` que anuncia «N de M lugares confirmados». Los puntos son
decorativos y van con `aria-hidden`.

## Bug que atrapó la verificación

`.boton-morado` y `.boton-rosa` llevaban `sm:hover:opacity-92`. Esa clase no
existe: la escala de opacidad de Tailwind salta de 90 a 95. Habría reventado
el build con `CssSyntaxError`. Corregido a `opacity-90`.

---

# Entrega 3 — ajustes, asistentes, portada y densidad

## Mensaje de WhatsApp configurable

Migración `0003_whatsapp_plantilla.sql`: columna `whatsapp_plantilla` en
`evento`. Nula = usar la plantilla del código, así que borrar el campo
devuelve el texto sugerido en vez de dejar el mensaje en blanco, y cambiar el
sugerido más adelante alcanza a quien nunca lo editó.

`lib/whatsapp.ts` tiene las dos plantillas por omisión (individual y grupal),
los marcadores y `armarMensaje`. Dos decisiones que no son de estilo:

- Un marcador mal escrito se deja tal cual en el mensaje en vez de borrarse.
  Un `{lugarr}` visible se corrige; un hueco en blanco se manda.
- Si el texto final no contiene el link, se añade al final. Es el error fácil
  de cometer al editar la plantilla y deja el mensaje inservible.

`components/panel/MensajeWhatsapp.tsx` es el editor con vista previa en vivo
en burbuja de WhatsApp, y un conmutador individual/grupal porque el sugerido
cambia con el tipo.

## Asistentes agrupados

Formato elegido: **chip-grupo compacto**, agrupando **por invitación** (cada
link es un grupo), no por la columna `invitados.grupo`.

`components/ListaAsistentes.tsx` exporta dos cosas:

- `ListaAsistentes` (portada) — una píldora por invitación confirmada con los
  integrantes en texto corrido.
- `MiGrupo` (`/i/[token]`) — solo la unidad de quien abre el link, los lugares
  libres, el total general y el botón «Ver quiénes van» hacia `/#asistentes`.
  Enumerar aquí a los demás invitados convertiría cada link personal en un
  directorio de la fiesta.

`MiGrupo` solo se monta si ya confirmaron: antes de eso el formulario de
arriba dice todo lo que hay que decir.

## Portada ampliada

- `config/galeria.ts` + `components/Album.tsx`: tira horizontal con `snap`,
  marco de oro y pie en Cinzel. Horizontal y no cuadrícula porque seis fotos
  en cuadrícula a 360 px son miniaturas de 100 px donde no se distingue una
  cara. Solo la primera lleva `priority`.
- `foco` por foto en `galeria.ts`: las fuentes van de 598×1600 a 719×720 y
  todas se muestran en 3:4; sin ese `object-position` el recorte se come la
  cara en las verticales largas.
- Mesa de regalos añadida a la portada, que tenía menos secciones que la
  invitación.
- `Seccion` admite `ancla` con `scroll-mt`, para que el atajo aterrice sin
  pegar el título al borde superior.

## Densidad (opción 3)

- `public/recursos/tema/patron-petalos.svg` — mosaico de 260 px repetido en
  `body::after`, fijo, al 55 % de opacidad. **Cubre cualquier alto de scroll y
  pesa 1.5 KB.** Esa es la respuesta barata a «que llene el alto de la
  página»: SVG repetido, no una foto estirada.
- `components/Ornamento.tsx` — filigrana de oro bajo cada título de sección.
- `.tarjeta-oro` — esquinas de oro para las tarjetas ceremoniosas.

Se probaron tres opacidades: 0.5 no se ve, 0.85 compite con los títulos, 0.55
se lee como textura. La perilla está en `body::after` de `globals.css`.

## Ilustración larga (opción 1)

Montada y apagada. Ver `PLAN-DESIGN/fondo-largo.md` para la especificación del
archivo y el prompt. `components/FondoLargo.tsx` usa `background-image` de CSS
y no `next/image` a propósito: si el archivo no existe, no se pinta nada; con
`next/image` una ruta inexistente revienta en desarrollo.

## Falsa alarma que costó tiempo, anotada para no repetirla

El mosaico parecía desplazarse con el scroll en las capturas. No era cierto:
`scroll-behavior: smooth` está activo en `html`, y la captura salía a mitad de
la animación. Con `behavior: 'instant'` la diferencia entre dos posiciones de
scroll es de cero píxeles. Al verificar capas fijas con Playwright hay que
desactivar el scroll suave primero.

---

# Entrega 4 — cabecera ilustrada, carrusel con marco y movimiento

## Lo que había que saber de los dos archivos antes de usarlos

**`marco_princesa.png`** venía en **RGB, sin canal alfa**, 1560×1554, 4.9 MB.
No es un marco recortable: es una ilustración opaca. Sirve como fondo, no
como capa. Comprimido a `marco-cabecera.webp`, 1160 px, **133 KB**.

**`marco_carruselFotos.png`** son **dos marcos en un solo archivo**, y solo uno
sirve para fotos:

- El **izquierdo** tiene el hueco realmente transparente (alfa 0). Ese es el
  del carrusel → `marco-foto.webp`, 620 px, 127 KB.
- El **derecho** tiene el interior **blanco opaco** (alfa 252). Una foto detrás
  no se vería. Es un marco de texto, no de fotos. Guardado como
  `marco-texto.webp` (100 KB) para cuando haga falta un bloque de texto
  ceremonioso; hoy no se usa.

## Cómo encaja la foto en el marco

No con una elipse aproximada. El hueco tiene el borde muy difuso y una elipse
dejaría la foto asomando o un halo entre las dos. Se hace así:

1. Relleno por difusión sobre el canal alfa del marco desde el centro del
   hueco → forma exacta del agujero.
2. Esa forma se guarda como `marco-foto-mascara.png` (380 px, 19 KB).
3. La foto va detrás, recortada con `mask-image` usando esa máscara, dentro de
   la caja del hueco: `left 6.05% / top 0% / width 87.11% / height 73.17%`.

Esas medidas están en `MARCO_FOTO` en `config/galeria.ts`. Si se cambia el
archivo del marco hay que volver a medirlas, no ajustarlas a ojo.

## El lavado de las fotos no es adorno

Una foto cruda dentro del marco se ve como un recorte pegado: el fondo real
—globos verdes, baldosas de patio, una pared beige— choca de frente con la
escena morada. `scripts/album.py` aplica desenfoque y tinte lila radial hacia
el borde, con **cuatro intensidades según lo ruidoso que sea el fondo**:

| Foto | Fondo | Lavado |
| --- | --- | --- |
| album-01 | patio de baldosas | fuerte |
| album-02 | escalera | medio |
| album-03 | césped | fuerte |
| album-04 | primer plano, fondo liso | suave |
| album-05 | globos verdes + lentejuelas | máximo |
| album-06 | pared beige | medio |

La de la graduación necesitó el máximo: a media potencia el verde seguía
ganándole al morado. Las seis suman **97 KB**.

## Cabecera

Proporción 1:1, la del marco. Recortarla a un formato más alto con `cover` se
comería la corona, el conejo y el castillo, que viven en los bordes.

La zona clara del archivo va del 23 % al 72 % de ancho y del 20 % al 78 % de
alto, medido sobre los píxeles. **Esa medida se pasa de optimista**: se hizo
recorriendo desde el centro hacia afuera, y por la derecha suben las torres
del castillo justo donde cae la fecha. Con la fecha en `#5c3a80` sobre el
resplandor y las torres, no se leía. Solución: un velo crema radial detrás del
texto —del mismo tono que el resplandor que ya tiene el arte, así que no se
lee como una capa— más `#452a66` y sombra blanca en la fecha.

La cabecera no lleva `corona.png` suelta: el marco ya trae una y repetirla se
vería como un error.

## Movimiento

Todo dentro de `prefers-reduced-motion: no-preference`, y **el estado inicial
oculto de `.revela` también**. Si ese estado viviera fuera de la media query,
alguien con movimiento reducido vería media página en blanco esperando un
disparador que nunca llega.

- `components/Revelar.tsx` — IntersectionObserver por elemento, no un listener
  de scroll: el listener obliga a leer geometría en cada cuadro y en un móvil
  se siente como scroll pegajoso. Se desconecta al revelar; animar de vuelta al
  salir convierte el scroll hacia arriba en un parpadeo. Sin
  `IntersectionObserver`, se marca visible de inmediato.
- Efectos: `sube`, `zoom`, `giro`, `izq`, `der`, con escalonado 1-4.
- Continuos: `.flota`, `.respira` (el marco de la cabecera, 3.5 % en 14 s),
  `.brilla` (recorre el degradado del «XV»), `.destello`, `.vaiven`.
- Carrusel: la tarjeta centrada crece y se endereza, las de los lados quedan
  al 88 % giradas y desaturadas. También con IntersectionObserver, sobre la
  tira, en vez de leer `scrollLeft`.

El mosaico de pétalos bajó de 0.55 a 0.38: en escritorio los márgenes son
anchos y a 0.55 competía con la cabecera ilustrada.

## Peso medido

Portada con cabecera y carrusel, medido en el navegador:

- **347 KB** sin tipografías
- **458 KB** con las cuatro familias

De eso, 260 KB son los dos marcos, que se cachean y se reusan en toda la
navegación. Las seis fotos del álbum suman 97 KB.

## Pendiente

- `npm run build` completo. `npx tsc --noEmit` pasa limpio, y la portada está
  verificada visualmente a 360, 375 y 1440 px sin desborde horizontal, pero el
  build de producción no se pudo terminar desde la sesión remota: sobre el
  disco montado tarda más que la ventana de cada comando. Correrlo en Windows
  nativo.
- Deploy de prueba en Vercel para confirmar que las rutas en minúscula
  resuelven (Linux sí distingue mayúsculas).
- Lighthouse móvil.
- Borrar `PLAN-DESIGN/_to_delete/` (variantes descartadas del retrato). La
  sesión remota no tiene permiso de borrado.
- Verificar el stepper con invitaciones de 6 u 8 lugares: si resulta lento,
  vuelve a ser un `<select>`.
- Validar cabecera y carrusel antes de seguir con el resto de las secciones.
- Llevar el marco ilustrado a la cabecera de `/i/[token]`, que hoy sigue con
  el degradado y el castillo.
- El resto de secciones de la portada y de la invitación (contador, lugar,
  itinerario, dress code, regalos, lista) y el panel: hoy solo están
  revestidos por la paleta, sin ilustración.
- `marco-texto.webp` está generado y sin usar; es el candidato natural para
  el bloque «Confirma tu lugar» o para el saludo del cartucho.

---

# Entrega 5 — portada a pantalla completa

## El marco cuadrado no se recorta: se parte en tres

El problema real no era la proporción sino que `marco_princesa.png` es un
**marco**: lo reconocible vive en el borde —corona arriba-izquierda,
conejo abajo-izquierda, castillo abajo-derecha, péndulo a la derecha— y el
centro es crema limpia. Cualquier `cover` a formato vertical se come
justo el borde. Y una sola imagen vertical larga obliga a fijar una
proporción que no existe: 0.46 en un iPhone 15, 0.56 en un Android de
640. Siempre recorta por algún lado.

`scripts/portada.py` lo parte en tres a la altura del **43 %**:

| archivo | contenido | tamaño |
| --- | --- | --- |
| `portada-superior.webp` | corona, cortinas, borlas, rosas de arriba | 1160×497, 71 KB |
| `portada-medio.webp` | la fila del corte, extruida | 1160×6, **0.8 KB** |
| `portada-inferior.webp` | péndulo, castillo, conejo, pájaro, rosas | 1160×659, 98 KB |

En el componente las dos bandas van a su alto natural (`shrink-0`) y la
tira del medio absorbe la diferencia con `background-size: 100% 100%`.
Resultado: la portada llena **cualquier** alto de pantalla sin recortar
nada y sin costuras.

**Por qué no hay costura.** Las tres piezas comparten la misma fila
promediada: la tira es esa fila repetida, y las últimas 26 filas de la
banda superior y las primeras 26 de la inferior se funden hacia ella. Sin
ese fundido queda un salto de un par de niveles que en una cortina lisa
se lee como una línea recta.

**Por qué el corte va en 43 % y no en otro sitio.** Medido sobre el
archivo: corona 2–20 %, borla izquierda 24–40 %, borla derecha 28–42 %,
péndulo 43–48 %, cúpula de oro 44–62 %, torres 47–88 %, conejo 65–95 %.
El 43 % es la única franja sin nada: las dos borlas ya terminaron y el
péndulo, la cúpula y el castillo no han empezado. Lo único que cruza es
la cadena de oro, que es una línea vertical y al extruirse se lee como
una cadena más larga que baja hasta el péndulo — sale mejor que el
original. **Si se cambia el archivo del marco hay que volver a medir
estas franjas; mover el corte a ojo parte una borla o un castillo.**

Una cortina colgando es un degradado vertical, y por eso extruir una fila
da tela y no un manchón. La zona estirada se lee como columnas de tela
larga. Lleva encima un degradado de sombra muy tenue porque la extrusión
es perfectamente uniforme y a partir de unos 300 px eso empieza a leerse
como papel tapiz.

## Lo que la portada NO lleva, a propósito

**Ni corona suelta ni `castillo.png` al pie.** El marco ya trae los dos.
Repetirlos en la misma pantalla se lee como un error de montaje, no como
abundancia — es el mismo argumento por el que la cabecera anterior ya
había descartado la corona suelta. Dejar fuera la corona además liberó
los ~60 px verticales que hacían falta para que la burbuja y el nombre
entren en un teléfono de 640.

## Contenido, del tablero 4a

Orden: «MIS XV AÑOS» → burbuja (retrato + aro de oro) → nombre en Great
Vibes → filigrana → fecha. La frase se quedó **fuera** de la portada:
dentro obligaba a encoger la burbuja o el nombre, y es lo primero que se
lee al hacer scroll.

- El aro es `.aro-oro` en `globals.css`, con el `conic-gradient` que abre
  y cierra en `#c08a2e`. El tablero 4a abre en crema y cierra en oro: a
  140° eso deja la costura recta.
- El bloque se centra sobre la tira del medio, que es el corredor crema.
  En pantallas cortas desborda hacia las bandas, pero solo por el centro.
- **Tope de 300 px de ancho al bloque.** Sin él, la fecha en versalitas
  con interletraje `0.2em` llegaba de cortina a cortina a 360 px y se
  metía debajo del péndulo. Ahora ocupa el 26–74 % del ancho, medido.
  A 360 px la fecha va a 10 px con `0.16em`; desde `sm`, a 12 px.
- Cuatro destellos del 4a, recolocados dentro del corredor crema: en las
  posiciones originales caían sobre la cortina, donde no se ven.
- Una punta de flecha al pie sobre el valle del río. Una portada de alto
  completo sin nada que indique que hay más abajo se lee como una página
  de una sola pantalla.

`.portada-alto` lleva `100vh`, `100svh` y `100dvh` en cascada, en ese
orden. Tailwind no puede expresar tres declaraciones sobre la misma
propiedad, por eso está en `globals.css` y no como clase utilitaria.

## Verificado

- `npx tsc --noEmit` limpio.
- Tailwind compilado con el CLI sobre el código real: sin `CssSyntaxError`,
  o sea sin clases inexistentes.
- Réplica estática (`PLAN-DESIGN/pruebas/_replica.html` + `_tw.css`, que
  se dejan justo para esto) servida y capturada con Playwright a
  360×640, 390×740, 430×932, 1440×900 y 1440×650. En los cinco:
  `scrollWidth == clientWidth` —sin desborde horizontal— y la portada
  mide exactamente el alto de la ventana. A 1440×650, el caso peor, las
  dos bandas suman 598 px y entran.
- Capturado también con `prefers-reduced-motion: reduce`: la portada se ve
  completa y quieta.

## Peso

Las tres piezas suman **169 KB** contra los 133 KB de
`marco-cabecera.webp`. Son 36 KB más por partir el original en dos
archivos con calidad 84. Medido sobre la réplica estática con `<img>`,
como el número anterior: la portada sola pesa 256 KB sin tipografías.
**En la app real, con `next/image`, no está medido.**

`marco-cabecera.webp` queda sin usar en el código; sigue en `public/`
porque es el candidato para la cabecera de `/i/[token]`.

## `album-04` — encuadre corregido

`angeles-02.jpg` es una selfi en contrapicado cerradísima: el recorte
cuadrado ya toma el lado completo, así que **no se podía abrir más
recortando**. `scripts/album.py` gana un parámetro `margen`: monta la
foto más pequeña dentro del lienzo y rellena el borde con ella misma
desenfocada. Dos cosas que costaron un intento cada una:

1. El relleno es la misma foto **sin retocarle el brillo**. Un punto más
   claro y el montaje se ve como una calcomanía pegada.
2. La transición es una **elipse muy difuminada, no un rectángulo**. Con
   borde recto se ve la caja del montaje aunque esté difuminada: una línea
   recta dentro de una foto no existe y el ojo la encuentra sola. La
   elipse además coincide con la forma del hueco del marco.

`album-04` va con `margen 0.24` y lavado `medio` (antes `suave`): el radio
donde empieza el lavado, 0.74, cae justo en el borde de la elipse. El
álbum sigue en 94 KB.

---

# Entrega 6 — indicador, horizonte y movimiento

## El indicador del carrusel vivía dentro del scroller

`components/Album.tsx` tenía los puntos como hermano del `<ul>` **dentro**
del contenedor con `overflow-x-auto`. Un hijo de bloque dentro de un
contenedor con scroll resuelve su ancho contra el ancho **visible**, no
contra el del contenido: los puntos quedaban clavados en el origen del
scroll y se iban de pantalla al avanzar el carrusel. Encima heredaban el
`pb-4` del scroller y aparecían pegados al pie de la primera foto.

Ahora el scroller y el indicador son hermanos dentro de un envoltorio, y
el indicador lleva `mt-5`. El pie de foto pasó de `mt-1` a `mt-2`.

Medido con Playwright a 360, 390 y 1440: el centro del indicador está al
50 % del ancho **y sigue al 50 % después de desplazar el carrusel 600 px**.
Antes esa segunda medida era la que fallaba.

## Punto 2, opción B — el castillo una sola vez

`castillo.png` es una silueta plana lila; el sitio pasó a un lenguaje
fotorrealista. Repetida de fondo en cada sección no se lee como riqueza
sino como plantilla, y compite con el castillo que ya trae la portada.
`components/HorizonteCastillo.tsx` lo pone **una vez**, grande, al final
de la página, con máscara que lo desvanece por arriba. Va en el flujo
normal y no en absoluto: en absoluto tendría que pelearse con los
pseudoelementos fijos del `body`, que están en `z-index` -1 y -2.

Lo que sí se repite —variando— son **pétalos recortados del propio
marco**. `Seccion` gana `juego` (0, 1 o 2) y `fondo`. Tres juegos de tres
pétalos que rotan por sección para que dos seguidas nunca lleven el mismo
dibujo. El álbum va con `fondo="ninguno"`: ya tiene los suyos encima del
marco.

**Las posiciones están escritas a mano, no salen de `Math.random()`.** Con
aleatorio el servidor y el cliente pintan cosas distintas y React tira un
error de hidratación.

**`overflow-hidden` en `Seccion` no es cosmético**: los pétalos se colocan
en porcentajes y sin recorte el que va al 90 % empuja el ancho del
documento y aparece scroll horizontal en un móvil.

## Punto 3 — de dónde salen los pétalos, y por qué las rosas esperan

`scripts/ornamentos.py` etiqueta las **componentes conexas del canal
alfa** de `marco-foto.webp`. El marco es una sola masa conectada por el
borde; lo único aislado dentro del hueco son los pétalos que el
ilustrador dejó flotando. Eso los encuentra solos, con su alfa real, sin
inventarles una silueta ni recortarlos a ojo. Salieron once; se exportan
los seis mayores al doble de tamaño. **El `petalo-5` está descartado a
mano en `config/galeria.ts`: arrastra una esquina de cortina morada.**

Los cuatro racimos de rosas también se recortan, con su posición exacta
en % del marco. Pero **la capa de rosas está apagada a propósito**:

> Montar la copia de una rosa encima de la rosa que el marco ya trae
> pintada compone dos veces el mismo borde semitransparente. Medido: el
> contorno sale hasta 64/255 más oscuro en 10 113 píxeles. **No es la
> compresión** — el mismo experimento en WebP sin pérdida da idéntico
> resultado. Es el doble alfa. Y mientras el original está debajo, el
> recorrido no puede pasar de un par de píxeles sin que asome.

Por eso `MARCO_FOTO.sinRosas` empieza en `false` y la capa no se renderiza.
Cuando exista el marco sin rosas: apuntar `MARCO_FOTO.marco` al archivo
nuevo y poner `sinRosas: true`. La capa se enciende con `.mece-amplio`
—3 px y 1.8°— sin tocar nada más.

Lo que sí funciona hoy son **tres pétalos a la deriva sobre la tarjeta
activa**, con ancho en % y no en píxeles porque la tarjeta mide 72vw en
móvil y 300 px desde `sm`. Solo en la activa: seis tarjetas por tres
pétalos animados son dieciocho composiciones simultáneas y en un móvil
eso se siente en el scroll.

Los tres ritmos (`.deriva`, `-b`, `-c`) tienen periodos 11/14/17 s,
primos entre sí, para que el conjunto no caiga en sincronía; con periodos
parecidos el ojo detecta el compás y se ve como un GIF en bucle. El giro
base llega en `--giro` desde el estilo en línea y los keyframes lo
**suman** con `calc()` en vez de sustituirlo: si el keyframe pusiera
`rotate(9deg)` a secas, cada pétalo perdería su orientación al arrancar y
daría un salto visible.

## Verificado

`tsc` limpio, Tailwind compilado con el CLI sin errores, y capturas a
360×640, 390×740 y 1440×900. En las tres: `scrollWidth == clientWidth`,
indicador fuera del scroller y centrado antes y después de desplazar.

## Pendiente que depende de Kevin

Los dos archivos que hay que generar están descritos en
`PLAN-DESIGN/prompts-generacion.md`. Hasta que existan:

- La portada sigue con las tres bandas del marco cuadrado.
- `rosa-si/sd/ii/id.webp` están generados y **sin usar** — como
  `marco-texto.webp`. No se sirven.

---

# Entrega 6 — vuelta al tablero 4a/5a, todo en CSS (2026-09-27)

Decisión de Kevin: dejar de depender de imágenes generadas por IA y volver
al diseño 4a/5a, subiendo el nivel con CSS. Maqueta aprobada en
`PLAN-DESIGN/pruebas/maqueta-portada.html` y `maqueta-invitacion.html`.

## Qué imágenes quedan

Solo `castillo.png`, `fondo-invitacion.png` y las fotos
(`retrato.jpg`, `album-0*.webp`). El castillo ya no se muestra como
imagen: es **máscara** (`.castillo` en `globals.css`) rellena con un
degradado de atardecer y ventanas encendidas. Corona, perlas, lazo,
joyas y volutas son SVG en `components/tema/Ornamentos.tsx`; sus
degradados se definen una vez en `<DefsTema />` dentro del layout.

## Componentes

- Nuevos: `Portada` (sustituye a `Cabecera`), `Camafeos` (sustituye a
  `Album`), `Itinerario`, `tema/Ornamentos`.
- Reestilizados: `Seccion` (eyebrow + título + ornamento, sin pétalos),
  `Contador` (medallones), `Lugar`, `Ornamento`, `Cartucho`,
  `HorizonteCastillo`, `ListaAsistentes` (insignia con los lugares).
- Sin usar pero sin borrar: `Cabecera`, `Album`, `Petalos`, `FondoLargo`
  y los recursos `portada-*`, `marco-*`, `petalo-*`, `rosa-*`. Las
  versiones anteriores de los archivos reescritos están en
  `PLAN-DESIGN/_respaldo-diseno-ia/` con extensión `.txt` (si quedan como
  `.tsx`, `tsc` y el build los compilan y fallan).
- `.tarjeta` del panel no se tocó; lo ceremonioso usa `.tarjeta-real`.

## Cambios de orden

En `/i/[token]` el formulario RSVP sube justo debajo del cartucho, como
en 5a. La información de la fiesta va después.

## Trampas nuevas

- `overflow: hidden` en la sección cortaba en recto las sombras de las
  tarjetas. `Seccion` usa `overflow-x: clip`.
- Un velo del color del fondo para desvanecer el castillo deja una
  franja, porque el fondo es un degradado. Se desvanece con `mask`.
- Un trazo SVG horizontal con degradado `objectBoundingBox` no se pinta
  (caja de alto cero). Las líneas del ornamento van en color sólido.
- `fechaLarga` en versalitas parte en dos líneas a 390 px. La portada
  usa `fechaSinDia` (nueva en `lib/evento.ts`).
- En clases arbitrarias de Tailwind, `calc()` va con `_` alrededor de
  los operadores.

## Verificado

`npx tsc --noEmit` limpio; Tailwind compilado con el CLI sin errores.
Render de las páginas reales con `react-dom/server` y datos de prueba
(mocks de Supabase, `next/image` como `<img>`), capturado a 360, 390 y
1440 px con y sin movimiento reducido: sin scroll horizontal, fecha en
una línea. **Falta** `npm run dev` / `npm run build` en Windows.
