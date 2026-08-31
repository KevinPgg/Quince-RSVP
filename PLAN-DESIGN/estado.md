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
