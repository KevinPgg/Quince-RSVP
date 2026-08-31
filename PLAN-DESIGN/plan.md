# Temática «Princesa Sofía» — plan de implementación

Handoff para trabajar en el repo `Quince-angeles` con Claude Code.
Diseño aprobado: **4a** (portada) y **4b** (paleta) del documento `Tematica Princesa Sofia.dc.html`.

**Alcance de esta entrega:** solo la portada `/`. El resto del sitio se reviste solo, porque
`app/page.tsx`, `components/*` y `app/i/[token]/*` ya usan las clases `primary`, `accent`,
`muted`, `line` que apuntan a las variables CSS.

**Dirección visual:** clara de arriba a abajo. Base lila muy pálido, oro viejo para lo
ceremonioso, rosa fucsia solo en el nombre. Silueta de castillo tendida a lo ancho detrás de
todo, al pie. Retrato circular con aro de oro. Sin fondos oscuros en ninguna parte.

---

## Paso 1 — Reorganizar `public/`

Hoy:

```
public/Recursos/
  Cumpleanera/  WhatsApp Image 2026-08-23 at 1.15.44 PM (1).jpeg   (×7)
  IA/           marco_princesa.png
```

Objetivo:

```
public/recursos/
  cumpleanera/  angeles-01.jpg … angeles-07.jpg
  tema/         castillo.png  corona.png  fondo-invitacion.jpg
```

Dos razones para renombrar, las dos son errores en producción y no cuestión de gusto:

- Los espacios y paréntesis del nombre de WhatsApp rompen la URL al servirse.
- `Recursos` con mayúscula funciona en macOS, que no distingue mayúsculas, y falla en el
  servidor de Vercel, que sí las distingue. Todo en minúscula.

```bash
cd public
mkdir -p recursos/cumpleanera recursos/tema
i=1; for f in Recursos/Cumpleanera/*.jpeg; do
  printf -v n "%02d" $i; mv "$f" "recursos/cumpleanera/angeles-$n.jpg"; i=$((i+1))
done
mv Recursos/IA/marco_princesa.png recursos/tema/marco-princesa.png
rmdir Recursos/Cumpleanera Recursos/IA Recursos
```

Elegir cuál de las siete fotos va en el retrato circular y copiarla como
`recursos/cumpleanera/retrato.jpg`. Debe ser cuadrada o recortable a cuadrado con la cara
centrada; si no lo es, recortarla antes con photopea.com.

---

## Paso 2 — Generar las tres imágenes

Ninguna es urgente: la portada funciona y se ve bien sin ellas. Se pueden ir metiendo después.

### `recursos/tema/castillo.png` — 1600 × 620, PNG con transparencia

> Silueta plana de un castillo de cuento, torres delgadas con techos cónicos y banderines,
> vista frontal a lo ancho, sin detalle interior, un solo color lila pálido sobre fondo
> blanco liso, estilo vectorial limpio, sin texto, sin gente, sin marco.

### `recursos/tema/corona.png` — 600 × 420, PNG con transparencia

> Corona pequeña de princesa vista de frente, cinco puntas, líneas finas de oro viejo,
> ilustración plana elegante sobre fondo blanco liso, sin brillos ni degradados fuertes,
> sin texto.

### `recursos/tema/fondo-invitacion.jpg` — 1080 × 1620

Para la siguiente entrega (`/i/[token]`), no se usa todavía.

> Fondo vertical acuarela en lila muy claro y blanco, pétalos y destellos suaves en las
> esquinas superiores e inferiores, centro limpio y vacío para poner texto, sin personajes,
> sin castillo, sin texto.

### Herramientas gratuitas

| Para | Herramienta |
| --- | --- |
| Generar | ChatGPT, Google ImageFX (labs.google/fx), Bing Image Creator |
| Quitar el fondo blanco | remove.bg o photopea.com |
| Comprimir | squoosh.app |

ChatGPT no entrega transparencia real: genera sobre fondo blanco liso y quita el fondo
después. Ninguna imagen debe pasar de ~200 KB.

---

## Paso 3 — `app/globals.css`

Sustituir el bloque `:root` completo. Los siete valores son los de **4b**. Nada más de ese
archivo se toca: las clases `.tarjeta`, `.boton`, `.campo` ya leen de aquí.

```css
:root {
  --c-base:    253 250 255;  /* lila casi blanco */
  --c-surface: 255 255 255;
  --c-ink:      58  40  74;  /* morado muy oscuro, no negro */
  --c-muted:   109  85 128;
  --c-primary: 123  63 160;  /* morado real */
  --c-accent:  192 138  46;  /* oro viejo */
  --c-line:    233 220 243;

  --f-display: 'Cormorant Garamond', Georgia, serif;
  --f-body:    'Jost', system-ui, sans-serif;

  color-scheme: light;
}
```

La portada usa dos tipografías más. Reemplazar el `@import` de la primera línea:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Jost:wght@300;400;500&family=Cinzel:wght@400;600&family=Great+Vibes&display=swap');
```

Y registrarlas en `tailwind.config.ts`, dentro de `theme.extend.fontFamily`:

```ts
cinzel: ['Cinzel', 'serif'],
firma:  ['"Great Vibes"', 'cursive'],
```

El rosa `#b52272` del nombre **no** entra en los siete tokens. Es exclusivo de la portada y va
escrito literal en `page.tsx`. Si acaba usándose en tres o más lugares, ahí sí conviene
promoverlo a `--c-rosa`.

---

## Paso 4 — Portada en `app/page.tsx`

Sustituir **solo** el primer `<section>` (el bloque `{/* ---------- Portada ---------- */}`).
Todo lo que va después —contador, secciones, itinerario, dress code, CTA— se queda igual y se
reviste solo con la paleta nueva.

Añadir el import arriba del archivo:

```tsx
import Image from 'next/image'
```

Y el bloque:

```tsx
{/* ---------- Portada ---------- */}
<section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-7 text-center aparece">
  {/* Castillo al pie, detrás de todo */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] opacity-50">
    <Image src="/recursos/tema/castillo.png" alt="" fill priority
           className="object-cover object-bottom" />
  </div>
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]
                  bg-gradient-to-b from-transparent via-base/85 to-base" />

  <div className="relative flex flex-col items-center">
    <Image src="/recursos/tema/corona.png" alt="" width={132} height={92} priority
           className="mb-3.5 h-[46px] w-auto" />

    <p className="text-[10px] uppercase tracking-[0.42em] text-muted">Mis XV Años</p>

    {/* Retrato con aro de oro */}
    <div className="relative mt-6 h-[172px] w-[172px]">
      <div className="absolute -inset-[9px] rounded-full shadow-[0_14px_34px_rgba(92,43,134,0.18)]
                      [background:conic-gradient(from_140deg,#f4e0ae,#c08a2e_22%,#f7ecc9_42%,#b07d24_62%,#eed9a4_82%,#c08a2e)]" />
      <div className="absolute -inset-0.5 rounded-full bg-base" />
      <Image src="/recursos/cumpleanera/retrato.jpg" alt={e.nombre} fill priority
             sizes="172px" className="rounded-full object-cover" />
    </div>

    <h1 className="mt-6 pt-[0.14em] font-firma text-[4.75rem] leading-none text-[#b52272] sm:text-[6rem]">
      {e.nombre}
    </h1>

    {/* Filigrana */}
    <div className="mt-4 flex items-center gap-3">
      <span className="h-px w-[74px] bg-gradient-to-r from-transparent to-accent" />
      <svg width="15" height="14" viewBox="0 0 22 20" aria-hidden>
        <path d="M11 19C4 13.5 1 10.3 1 6.8 1 3.6 3.4 1 6.5 1 8.4 1 10.1 2 11 3.6 11.9 2 13.6 1 15.5 1 18.6 1 21 3.6 21 6.8c0 3.5-3 6.7-10 12.2Z"
              fill="#c2417d" />
      </svg>
      <span className="h-px w-[74px] bg-gradient-to-l from-transparent to-accent" />
    </div>

    <p className="mt-4 font-cinzel text-xs font-semibold uppercase tracking-[0.2em] text-primary">
      {fechaLarga(e.fecha, ZONA_HORARIA)}
    </p>

    {e.frase && (
      <p className="mt-5 max-w-[270px] font-display text-[17px] font-light italic leading-relaxed text-muted text-pretty">
        {e.frase}
      </p>
    )}
  </div>
</section>
```

Notas de implementación:

- El fondo degradado va en `body`, no en la sección, para que no corte contra el contador.
  En `globals.css`, dentro de la regla `body`, sustituir `background-color` por:
  `background: linear-gradient(180deg,#fefcff 0%,#faf3fd 46%,#f3e9fa 78%,#ece0f6 100%) fixed;`
- `min-h-[100dvh]` en lugar de `80dvh`: con el retrato dentro, la portada pide la pantalla
  completa. En un iPhone SE (667 px de alto) todo el bloque mide ~640 px y entra justo.
- Los destellos animados del mock son decoración menor. Si se quieren, van como cuatro `<span>`
  absolutos con la animación `twinkle`; hay que añadir el `@keyframes` a `globals.css` dentro
  del `@media (prefers-reduced-motion: no-preference)` que ya existe.
- Si una imagen todavía no existe, `next/image` lanza error en desarrollo. Mientras falten,
  comentar ese bloque o usar un `<div>` vacío con el mismo tamaño.
- `alt=""` en castillo y corona es correcto: son decorativos y el lector de pantalla debe
  saltárselos. El retrato sí lleva `alt`.

---

## Paso 5 — Verificar

- [ ] Chrome DevTools a 360 px de ancho: nada se desborda en horizontal.
- [ ] Modo oscuro del sistema activado: el sitio sigue claro y los campos del formulario
      siguen legibles. `color-scheme: light` ya lo cubre, pero hay que comprobarlo.
- [ ] `/i/[token]` y `/invitacion` con la paleta nueva: los botones y bordes deben verse
      morados, sin restos del beige anterior.
- [ ] Lighthouse móvil: las tres imágenes bajo 200 KB, ninguna desplaza el layout al cargar.
- [ ] Deploy de prueba en Vercel: confirmar que las rutas en minúscula resuelven.

---

## Después de esto

`/i/[token]` con el mismo lenguaje, usando `fondo-invitacion.jpg`, más la pantalla de
confirmación y la de gracias. Está diseñado en **3c** del documento, pero en versión oscura:
hay que pasarlo a claro antes de implementarlo.
