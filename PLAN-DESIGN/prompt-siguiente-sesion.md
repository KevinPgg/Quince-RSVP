# Prompt para abrir la siguiente sesión

Copiar todo lo que sigue como primer mensaje de una sesión nueva sobre este
mismo proyecto local (`Quince-angeles`).

---

Continuamos el portal de invitaciones de XV años. El repo está montado en esta
sesión. Antes de tocar nada, lee `PLAN-DESIGN/estado.md`: es el estado real y
manda sobre `plan.md`, que está desactualizado en varios puntos.

## Qué es esto

Next.js 15 + Tailwind 3 + Supabase. Portal de invitaciones para los XV de
Ángeles. Rutas: `/` portada pública, `/i/[token]` invitación personal con RSVP,
`/i/[token]/gracias`, `/acceso` login, `/invitacion` gestión de invitaciones,
`/admin/*` panel del dueño.

Temática «Princesa Sofía», definida en `PLAN-DESIGN/Tematica Princesa Sofia.dc.html`
(tableros 4a portada, 4b paleta, 5a invitación, 5b gracias).

## Qué está hecho y verificado

- Portada `/` con cabecera ilustrada y carrusel del álbum.
- Invitación `/i/[token]`: héroe de 400 px, cartucho de oro con el saludo,
  formulario RSVP con stepper de puntos, pantalla de gracias.
- Paleta 4b en los siete tokens de `:root` de `app/globals.css`.
- Mensaje de WhatsApp configurable desde `/admin/ajustes` con marcadores y
  vista previa en vivo (`lib/whatsapp.ts`, `components/panel/MensajeWhatsapp.tsx`,
  migración `0003`).
- Asistentes agrupados por invitación: `ListaAsistentes` en la portada,
  `MiGrupo` en la invitación (`components/ListaAsistentes.tsx`).
- Sistema de movimiento: `components/Revelar.tsx` + clases en `globals.css`.
- Mosaico de pétalos SVG fijo detrás de toda la página.
- Herramienta de recuperación de acceso: `scripts/usuarios.mjs`.

## Decisiones cerradas — no las reabras

- Asistentes: formato «chip-grupo compacto», agrupando **por invitación**
  (cada link es un grupo), no por la columna `invitados.grupo`.
- El stepper de lugares del RSVP funciona; no volverlo `<select>`.
- El rosa `#b52272` del nombre va literal, fuera de los siete tokens.
- La densidad visual sube con ilustración alrededor y texto dentro de un
  cartucho o zona limpia. Nunca texto encima de la ilustración.

## Trampas técnicas ya pagadas — no las repitas

1. **`background: ... fixed` en `body` salta en Safari iOS.** El degradado y el
   mosaico de pétalos van en `body::before` / `body::after` con `position: fixed`.
2. **`fill` + `object-cover`/`object-contain` en un contenedor de altura fija
   destroza el castillo en escritorio.** Va anclado al ancho (`w-full h-auto`)
   con un `max-w-*`.
3. **Un `conic-gradient` para un aro debe abrir y cerrar en el mismo color** o
   se ve la costura.
4. **`background-clip: text` con `-webkit-text-fill-color: transparent` necesita
   guarda `@supports` y un `color` sólido de respaldo**, o el texto desaparece.
   Está resuelto en la clase `.xv-relleno`.
5. **La escala de opacidad de Tailwind salta de 90 a 95.** `opacity-92` no
   existe y revienta el build con `CssSyntaxError`. `tsc` no lo detecta.
6. **`public/` va todo en minúscula** (Vercel corre en Linux). Para renombrar
   en Windows hay que pasar por un nombre intermedio.
7. **Todo el movimiento vive dentro de `prefers-reduced-motion: no-preference`,
   incluido el estado inicial oculto de `.revela`.** Si el estado oculto queda
   fuera, alguien con movimiento reducido ve media página en blanco.

## Recursos de imagen — datos medidos, no los adivines

En `public/recursos/tema/`. Los originales pesados en `PLAN-DESIGN/originales/`.

- `marco-cabecera.webp` (1160×1155, 133 KB) — del `marco_princesa.png`
  original, que venía **en RGB sin canal alfa** y 4.9 MB. Es fondo, no capa.
  Zona clara medida: x 23–72 %, y 20–78 %, pero **esa medida se pasa de
  optimista** por la derecha, donde suben las torres del castillo. Por eso la
  cabecera lleva un velo crema radial detrás del texto.
- `marco-foto.webp` (620×711, 127 KB) — mitad **izquierda** de
  `marco_carruselFotos.png`. Es la única con el hueco realmente transparente.
- `marco-texto.webp` (640×957, 100 KB) — mitad **derecha** del mismo archivo.
  Su interior es **blanco opaco**: no sirve para fotos, es un marco de texto.
  Generado y hoy sin usar.
- `marco-foto-mascara.png` (380×436, 19 KB) — forma exacta del hueco, obtenida
  por relleno por difusión sobre el canal alfa del marco. La foto se recorta
  con `mask-image` usando esta máscara. **Nunca aproximes el hueco con una
  elipse**: el borde es difuso y deja halos.
- Geometría del hueco, en `MARCO_FOTO` de `config/galeria.ts`:
  `left 6.05% / top 0% / width 87.11% / height 73.17%`, proporción `620/711`.
- `album-01..06.webp` (97 KB las seis) — las genera `scripts/album.py` desde
  `angeles-*.jpg` con lavado radial (desenfoque + tinte lila hacia el borde) en
  cuatro intensidades. **La intensidad depende de lo ruidoso que sea el fondo
  real de la foto**: la de la graduación, con globos verdes, necesita el máximo
  o el verde le gana al morado del marco.

Peso de la portada: **347 KB sin tipografías, 458 KB con las cuatro familias**.
Ojo con ese número: está medido sobre una réplica estática con `<img>`, no
sobre la app real. Con `next/image` sirviendo variantes por viewport el real
debería ser menor, pero **nadie lo ha medido todavía en la app**. Si el peso
importa para una decisión, mídelo antes de citarlo.

## Cómo verificar desde esta sesión

- El repo está en Windows, montado. Cada comando corre en un shell nuevo con
  ventana de ~170 s y los procesos en segundo plano mueren al terminar.
- `npx tsc --noEmit` sí termina y es la comprobación de tipos útil.
- **`npm run build` no termina desde aquí.** Kevin lo corre en Windows y avisa
  si falla. No insistas.
- Para verificar CSS y layout: compilar Tailwind con el CLI en el contenedor
  apuntando `content` al código real y `-i` al `globals.css` real, servir con
  `python3 -m http.server` y capturar con Playwright
  (`executablePath: '/opt/pw-browsers/chromium'`) a 360, 390 y 1440 px.
  Eso atrapa clases inexistentes que `tsc` no ve.
- El contenedor no alcanza `cdn.tailwindcss.com` ni Google Fonts, pero npm sí:
  las tipografías se instalan con `@fontsource/*`.
- **Al verificar capas `position: fixed` con Playwright, desactiva
  `scroll-behavior: smooth` y usa `window.scrollTo({behavior:'instant'})`.** Con
  scroll suave la captura sale a mitad de animación y una capa fija correcta
  parece desplazarse. Ya se perdió una investigación entera con esto.
- La sesión no puede borrar archivos en las carpetas montadas. Lo descartado se
  mueve a `PLAN-DESIGN/_to_delete/`.
- La VM de la sesión no tiene red: los scripts que llaman a Supabase se corren
  desde Windows.

---

# LO QUE HAY QUE HACER

## 1. Convertir la cabecera en portada a pantalla completa

`components/Cabecera.tsx` hoy es un cuadrado 1:1 con el marco ilustrado de
fondo. **No combina con el resto de la página**: se lee como una estampa
pegada arriba, no como una portada.

Cámbialo a una portada que ocupe **todo el alto disponible del dispositivo**
(`100dvh` en móvil). Habrá que reescalar, recortar o retocar
`marco-cabecera.webp` para que funcione en vertical — el original es cuadrado
y sus elementos reconocibles (corona arriba a la izquierda, conejo abajo a la
izquierda, castillo abajo a la derecha) viven en los bordes, así que un
`cover` a lo bruto se los come. Haz lo que haga falta con la imagen: extender
el lienzo, recomponer los elementos, generar variantes. Que quede bien.

Con el espacio extra que gana la portada, **recupera lo que teníamos en la
versión anterior**:

- La **burbuja**: el retrato circular con aro de oro (`retrato.jpg` + el
  `conic-gradient` que ya está resuelto sin costura).
- El bloque de texto de esa versión: corona, «MIS XV AÑOS», el nombre en Great
  Vibes, la filigrana y la fecha.
- El **castillo** al pie.

## 2. El castillo pasa a ser el fondo por defecto de las secciones

`castillo.png` deja de ser exclusivo de la portada: úsalo como fondo por
omisión de las secciones que no tengan un estilo propio definido. Las que sí
lo tengan mantienen el suyo.

## 3. Nota para el carrusel

Se puede mejorar la animación del marco del carrusel extrayendo un conjunto
nuevo de elementos —flores y pétalos— del propio marco y animándolos por
separado, para darle dinamismo al marco en vez de mover solo la tarjeta
entera. Evalúalo y propón antes de implementarlo.

## Defecto conocido a revisar de paso

`album-04.webp` (de `angeles-02.jpg`) sale demasiado ampliada dentro del hueco
del marco: la foto original ya es un primer plano muy cerrado y el recorte
cuadrado deja prácticamente solo un ojo. Hay que alejar ese encuadre en
`scripts/album.py`.

## Estado de los pendientes

Ya resuelto, no lo repitas:

- La migración `0003_whatsapp_plantilla.sql` **ya está corrida en Supabase** y
  las funciones validadas. El mensaje de WhatsApp configurable funciona.
- `npm run build` corre bien en Windows. Kevin lo verifica él y avisa si falla.
- `PLAN-DESIGN/_to_delete/` y `PLAN-DESIGN/pruebas/` ya están vacías; solo
  quedan las carpetas.

Sigue pendiente:

- **Deploy de prueba en Vercel** — aplazado a propósito. No es prioridad ahora.
  Cuando toque, lo que hay que confirmar es que las rutas en minúscula
  resuelven, porque Linux distingue mayúsculas y Windows no.
- **Lighthouse móvil**, en Windows.
- **Llevar el marco ilustrado a la cabecera de `/i/[token]`**, que hoy sigue con
  el degradado y el castillo. Hacerlo después de validar la portada nueva.
- **La ilustración vertical larga hay que replantearla.** `ILUSTRACION_LARGA`
  en `config/galeria.ts` sigue en `null` y la capa `components/FondoLargo.tsx`
  está montada y apagada. La especificación y el prompt de generación están en
  `PLAN-DESIGN/fondo-largo.md`, pero **ese enfoque no convence todavía**: una
  sola imagen de 4000 px de alto es difícil de generar con calidad uniforme y
  cara en bytes. Vale la pena reconsiderar el planteamiento entero antes de
  invertir en generarla — quizá bandas ilustradas por sección, o extender los
  recursos que ya existen, salga mejor que una tira gigante.
- `marco-texto.webp` está generado y sin usar. Candidato natural para el bloque
  «Confirma tu lugar» o para el saludo del cartucho.
