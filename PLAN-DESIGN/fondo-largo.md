# Ilustración vertical larga — cómo generarla y montarla

La capa ya está en el código: `components/FondoLargo.tsx`, apagada porque
`ILUSTRACION_LARGA` es `null` en `config/galeria.ts`. En cuanto exista el
archivo, se enciende descomentando ese bloque. Mientras tanto la página se
sostiene con el degradado y el mosaico de pétalos, que ya cubren todo el
alto del scroll.

## Por qué una sola imagen larga y no cuatro

Cuatro ilustraciones generadas por separado no van a ser la misma escena por
mucho que compartan el prompt: cambian la luz, el trazo y la saturación entre
generaciones, y en un scroll continuo el salto se nota. Una sola imagen
vertical es la misma escena por construcción.

## Especificación del archivo

| Qué | Valor |
| --- | --- |
| Ruta | `public/recursos/tema/fondo-largo.webp` |
| Ancho | 1080 px (más no sirve: se muestra al 100 % del contenedor) |
| Alto | 3500–4500 px |
| Formato | WebP o AVIF |
| Peso | **bajo 250 KB** |

El peso es el requisito duro. La mitad de los invitados va a abrir el link
desde WhatsApp con datos móviles; una ilustración de 1.5 MB, que es lo que
sale por omisión de cualquier generador, se traduce en varios segundos de
pantalla a medias.

Comprimir en squoosh.app: WebP, calidad 62–70, sin metadatos.

## Prompt para generarla

> Ilustración vertical muy alta, formato 1080 × 4000, estilo acuarela suave
> sobre fondo blanco. Una escena continua de cuento de princesas que se lee
> de arriba a abajo: arriba pétalos y destellos flotando, al medio enredaderas
> con rosas pálidas y mariposas, abajo un jardín con setos recortados y la
> silueta lejana de un castillo. Paleta exclusivamente lila muy claro, rosa
> empolvado y oro viejo. La franja central de la imagen, unos 500 px de ancho,
> debe quedar prácticamente vacía y muy clara: ahí va el texto. Sin personajes,
> sin caras, sin texto, sin marco, sin bordes oscuros.

Herramientas: ChatGPT, Google ImageFX (labs.google/fx) o Bing Image Creator.
Ninguna genera 1080 × 4000 de una vez: pídele tres piezas verticales con el
mismo prompt y únelas en photopea.com difuminando las junturas, o genera una
y estírala verticalmente con relleno generativo.

## Encenderla

En `config/galeria.ts`, cambiar:

```ts
export const ILUSTRACION_LARGA: Ilustracion | null = {
  src: '/recursos/tema/fondo-largo.webp',
  opacidad: 0.32,
}
```

La opacidad es la perilla: 0.32 es punto de partida. Por encima de 0.45 el
texto de las tarjetas empieza a pelearse con el dibujo, y las tarjetas son
blancas opacas justamente para que eso no pase en el cuerpo del texto — el
riesgo está en los títulos de sección, que van sueltos sobre el fondo.

La capa usa `background-image` de CSS y no `next/image` a propósito: si el
archivo no existe, no se pinta nada y la página sigue. Con `next/image` una
ruta inexistente revienta en desarrollo y devuelve 400 en producción.
