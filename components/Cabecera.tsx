import Image from 'next/image'
import Filigrana from './Filigrana'
import { RETRATO_POR_OMISION } from '@/config/galeria'

/**
 * Portada a pantalla completa.
 *
 * ── Por qué tres imágenes y no una ────────────────────────────────
 * `marco_princesa.png` es cuadrado y es un MARCO: lo reconocible vive en
 * el borde (corona arriba-izquierda, conejo abajo-izquierda, castillo
 * abajo-derecha) y el centro es crema limpia. Un `cover` a formato
 * vertical se come justamente el borde. Y una sola imagen vertical
 * obliga a fijar una proporción que nunca coincide con el teléfono real
 * —0.46 en un iPhone 15, 0.56 en un Android de 640—, así que siempre
 * recorta por algún lado.
 *
 * `scripts/portada.py` parte el marco en tres a la altura del 43 %, la
 * única franja donde no cruza ningún objeto con forma propia. Aquí las
 * dos bandas van a su alto natural y la tira del medio —la fila del
 * corte extruida— se estira para absorber lo que sobre. Resultado: la
 * portada llena cualquier alto de pantalla sin recortar nada y sin
 * costuras, porque las tres piezas comparten esa misma fila.
 *
 * Una cortina colgando es un degradado vertical, así que la tira
 * estirada se lee como tela larga. La cadena de oro del lado derecho,
 * que es una línea, se alarga hasta el péndulo de la banda inferior.
 *
 * ── Lo que NO lleva ───────────────────────────────────────────────
 * Ni corona suelta ni `castillo.png` al pie. El marco ya trae los dos, y
 * repetirlos en la misma pantalla se lee como un error de montaje, no
 * como abundancia. `castillo.png` queda libre para el fondo de las
 * secciones de más abajo, donde no compite con nada.
 *
 * ── El texto no va encima de la ilustración ───────────────────────
 * El bloque se centra sobre la tira del medio, que es el corredor crema.
 * Cuando la pantalla es corta el bloque desborda hacia las bandas, pero
 * solo por el centro: las borlas están al 9-13 % y al 89-93 % del ancho,
 * y el bloque nunca pasa de ~270 px.
 */
export default function Cabecera({
  nombre,
  fecha,
  frase,
  retrato = RETRATO_POR_OMISION,
}: {
  nombre: string
  fecha: string
  frase: string | null
  retrato?: string
}) {
  return (
    <section className="relative">
      <div className="portada-alto relative mx-auto flex w-full max-w-[600px] flex-col overflow-hidden bg-[#f7e9d8] sm:rounded-[28px] sm:shadow-[0_18px_50px_rgba(92,43,134,0.16)]">
        {/* ---------- Banda superior: corona, cortinas, borlas ---------- */}
        <Image
          src="/recursos/tema/portada-superior.webp"
          alt=""
          width={1160}
          height={497}
          priority
          sizes="(min-width: 600px) 600px, 100vw"
          className="w-full shrink-0"
        />

        {/* ---------- Tira central estirada ----------
            `100% 100%` y no `cover`: la tira mide seis filas y la gracia
            es justamente deformarla en vertical. `min-h-0` para que en
            pantallas cortas ceda ella y no las bandas, que sí tienen
            proporción que respetar. */}
        <div
          className="relative min-h-0 flex-1"
          style={{
            backgroundImage: "url('/recursos/tema/portada-medio.webp')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Sombra larga de la tela. La extrusión es perfectamente
              uniforme y a partir de unos 300 px eso se nota como papel
              tapiz. Este degradado apenas la modula. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(120,74,40,0) 0%, rgba(120,74,40,0.07) 38%, rgba(120,74,40,0.05) 62%, rgba(120,74,40,0) 100%)',
            }}
          />

          {/* Velo crema detrás del bloque. Del mismo tono que el
              resplandor que ya tiene el arte, así que no se lee como una
              capa. Desborda a propósito hacia las dos bandas: el bloque
              también las invade cuando la pantalla es corta. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-40 -top-40"
            style={{
              background:
                'radial-gradient(ellipse 52% 42% at 50% 50%, rgba(255,252,246,0.86), rgba(255,252,246,0.55) 56%, rgba(255,252,246,0) 78%)',
            }}
          />

          {/* Destellos del tablero 4a, recolocados dentro del corredor
              crema: en las posiciones originales caerían sobre la
              cortina, donde no se ven. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Chispa left="28%" top="16%" tono="#e8d49a" />
            <Chispa left="71%" top="26%" tono="#d9b6ee" />
            <Chispa left="66%" top="74%" tono="#f0cfe2" />
            <Chispa left="31%" top="63%" tono="#e8d49a" />
          </div>

          {/* ---------- Bloque ---------- */}
          {/* `max-w` y no solo `px`: es lo que garantiza que ninguna línea
              llegue a las cortinas. La fecha en versalitas con
              interletraje es la línea más ancha y sin tope se metía
              debajo del péndulo a 360 px. */}
          <div className="absolute inset-x-0 top-1/2 mx-auto flex w-full max-w-[300px] -translate-y-1/2 flex-col items-center px-4 text-center sm:max-w-[380px]">
            <p className="text-[10px] uppercase leading-none tracking-[0.42em] text-[#8d6bab]">
              Mis XV Años
            </p>

            {/* Burbuja. El aro es un `conic-gradient` que abre y cierra en
                el mismo `#c08a2e`: si abriera en el crema, a 140° se vería
                el corte. El anillo blanco de en medio separa la foto del
                oro para que el oro se lea como marco y no como halo. */}
            <div className="relative mt-5 h-[150px] w-[150px] sm:mt-6 sm:h-[172px] sm:w-[172px]">
              <div className="aro-oro absolute -inset-[9px] rounded-full shadow-[0_14px_34px_rgba(92,43,134,0.18)]" />
              <div className="absolute -inset-[2px] rounded-full bg-[#fdfaff]" />
              <div className="absolute inset-0 overflow-hidden rounded-full bg-[#f0e6f7]">
                <Image
                  src={retrato}
                  alt={`Retrato de ${nombre}`}
                  width={344}
                  height={344}
                  priority
                  sizes="172px"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* `#b52272` va literal y fuera de los siete tokens: es el
                rosa de la firma, no un color del sistema. */}
            <p
              className="mt-6 font-firma text-[64px] leading-none text-[#b52272] sm:mt-7 sm:text-[76px]"
              style={{ paddingTop: '0.14em' }}
            >
              {nombre}
            </p>

            <div className="mt-4">
              <Filigrana ancho={74} />
            </div>

            <p className="mt-4 font-cinzel text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-[#5c3a80] sm:text-[12px] sm:tracking-[0.2em]">
              {fecha}
            </p>
          </div>
        </div>

        {/* ---------- Banda inferior: péndulo, castillo, conejo ---------- */}
        <Image
          src="/recursos/tema/portada-inferior.webp"
          alt=""
          width={1160}
          height={659}
          priority
          sizes="(min-width: 600px) 600px, 100vw"
          className="w-full shrink-0"
        />

        {/* Pista de scroll. Una portada de alto completo sin nada que
            indique que hay más abajo se lee como una página de una sola
            pantalla. Va sobre el valle del río, que es la única zona
            limpia de la banda inferior. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
        >
          <svg
            width="22"
            height="13"
            viewBox="0 0 22 13"
            className="flota drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
          >
            <path
              d="M2 2l9 8.5L20 2"
              fill="none"
              stroke="#a8145f"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
            />
          </svg>
        </div>
      </div>

      {/* La frase va fuera de la portada. Dentro obligaría a encoger la
          burbuja o el nombre, y es lo primero que se lee al hacer scroll:
          gana estando sola. */}
      {frase && (
        <p className="contenedor mt-8 text-center font-display text-[17px] font-light italic leading-relaxed text-muted text-pretty">
          {frase}
        </p>
      )}
    </section>
  )
}

function Chispa({ left, top, tono }: { left: string; top: string; tono: string }) {
  return (
    <span
      className="destello absolute block h-[5px] w-[5px] rounded-full"
      style={{ left, top, background: tono, boxShadow: `0 0 12px 3px ${tono}` }}
    />
  )
}
