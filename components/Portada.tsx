import Image from 'next/image'
import Filigrana from './Filigrana'
import { Brillos, CollarPerlas, Corona } from './tema/Ornamentos'
import Mariposa from '@/components/tema/Mariposa'
import Personaje from './tema/Personaje'

/**
 * Portada a pantalla completa — tablero 4a llevado a CSS.
 *
 * Sin ilustración generada: el cielo son degradados, la corona y las
 * perlas son SVG, y el castillo es `castillo.png` usado como MÁSCARA con
 * un degradado de atardecer. Llena cualquier alto de pantalla porque no
 * hay ninguna imagen con proporción propia que respetar.
 *
 * ── El texto no va encima del castillo ───────────────────────────
 * El `padding-bottom` reserva el alto del castillo (ancho × 0.545, su
 * proporción). En móvil se deja en 0.42 a propósito: solo las puntas de
 * las torres, ya desvanecidas, suben detrás de la frase. En escritorio el
 * castillo es de 520 px y se reserva entero.
 */
export default function Portada({
  nombre,
  fecha,
  frase,
  retrato,
}: {
  nombre: string
  fecha: string
  frase: string | null
  /** URL de la foto principal: Storage o el retrato del repo. */
  retrato: string
}) {
  return (
    <header
      className="portada-alto relative isolate grid place-items-center overflow-hidden pt-11
                 [--castillo-w:min(100vw,560px)] [padding-bottom:calc(var(--castillo-w)_*_0.42_+_36px)]
                 md:pb-[307px] md:[--castillo-w:520px]"
    >
      {/* ---------- Cielo: rayos + tres auroras ----------
          Dentro de un contenedor con máscara hacia abajo: sin ella las
          auroras se cortaban en seco contra el borde de la portada. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          WebkitMask: 'linear-gradient(0deg, transparent 0, #000 35%)',
          mask: 'linear-gradient(0deg, transparent 0, #000 35%)',
        }}
      >
        <div className="rayos absolute -left-[30%] -right-[30%] -top-[10%] h-3/4 opacity-50" />
        <div
          className="aurora-1 absolute left-1/2 top-[38%] h-[340px] w-[340px] rounded-full opacity-55 blur-[40px]"
          style={{ transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #f6d9ec, transparent 70%)' }}
        />
        <div
          className="aurora-2 absolute left-[18%] top-[20%] h-[260px] w-[260px] rounded-full opacity-55 blur-[40px]"
          style={{ background: 'radial-gradient(circle, #e3cdf7, transparent 70%)' }}
        />
        <div
          className="aurora-3 absolute right-[6%] top-[52%] h-[220px] w-[220px] rounded-full opacity-55 blur-[40px]"
          style={{ background: 'radial-gradient(circle, #f7e8c4, transparent 70%)' }}
        />
      </div>

      {/* ---------- Castillo ---------- */}
      <div aria-hidden className="fundido-abajo pointer-events-none absolute inset-0 -z-10">
        <div className="castillo w-[var(--castillo-w)] opacity-75" />
      </div>

      {/* ---------- Personajes ----------
          Pegados a la columna central (máx. 640 px), no a las orillas de
          la pantalla: en escritorio se perdían en los costados. Sin
          `transform` en el contenedor para no chocar con `.entra`. */}
      <div aria-hidden className="entra entra-6 pointer-events-none absolute inset-y-0 left-0 right-0 mx-auto max-w-[640px]">
        <Personaje n="azulejo" anim="vuela" ancho={92} className="left-[3%] top-[92px]" />
        <Personaje n="petirrojo" anim="vuela-b" espejado ancho={84} className="right-[2%] top-[210px]" />
        <Personaje n="conejo" anim="respira" ancho={86} className="bottom-[18px] left-[6%]" />
        {/* Mariposas junto a cada personaje: una persigue al azulejo, otra
            acompaña al petirrojo y la tercera revolotea sobre el conejo. */}
        <Mariposa ancho={34} tono="lila" vuelo="a" giro={18} className="left-[21%] top-[64px]" />
        <Mariposa ancho={26} tono="rosa" vuelo="b" giro={-22} retraso={4} className="right-[19%] top-[178px]" />
        <Mariposa ancho={30} tono="celeste" vuelo="a" giro={-12} retraso={7} className="bottom-[150px] left-[25%]" />
      </div>

      <Brillos
        lista={[
          { left: '12%', top: '11%' },
          { left: '86%', top: '16%', tipo: 'lila' },
          { left: '80%', top: '50%', tipo: 'rosa' },
          { left: '14%', top: '58%' },
          { left: '30%', top: '6%', tipo: 'lila' },
          { left: '70%', top: '8%', tipo: 'rosa' },
          { left: '22%', top: '30%', tipo: 'estrella' },
          { left: '74%', top: '34%', tipo: 'estrella' },
        ]}
      />

      {/* ---------- Bloque ---------- */}
      <div className="relative flex max-w-[340px] flex-col items-center px-7 text-center md:max-w-[420px]">
        <div className="entra entra-1">
          <Corona className="flota mb-3.5 h-12 w-[70px] drop-shadow-[0_3px_6px_rgba(160,110,30,0.28)] md:h-[58px] md:w-[84px]" />
        </div>
        <p className="eyebrow entra entra-2">Mis XV Años</p>

        {/* Retrato: halo, aro de oro que gira, separador, foto, collar. */}
        <div className="entra entra-3 relative mt-[22px] h-[172px] w-[172px] md:h-[200px] md:w-[200px]">
          <div
            aria-hidden
            className="absolute -inset-[26px] -z-10 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,244,214,.9) 30%, rgba(255,244,214,0) 70%)' }}
          />
          <div aria-hidden className="aro-oro aro-gira absolute -inset-[9px] rounded-full shadow-[0_14px_34px_rgba(92,43,134,0.18)]" />
          <div aria-hidden className="absolute -inset-[2px] rounded-full bg-[#fdfaff]" />
          <div className="absolute inset-0 overflow-hidden rounded-full bg-[#f0e6f7]">
            <Image
              src={retrato}
              alt={`Retrato de ${nombre}`}
              width={440}
              height={440}
              priority
              sizes="(min-width: 768px) 200px, 172px"
              className="h-full w-full object-cover"
            />
          </div>
          <CollarPerlas className="absolute -inset-[22px] h-[calc(100%+44px)] w-[calc(100%+44px)]" />
        </div>

        {/* `#b52272` va literal y fuera de los siete tokens. */}
        <h1
          className="entra entra-4 mt-[26px] font-firma text-[76px] font-normal leading-none text-[#b52272] md:text-[96px]"
          style={{ paddingTop: '0.14em', textShadow: '0 1px 0 rgba(255,255,255,.9), 0 6px 22px rgba(181,34,114,.18)' }}
        >
          {nombre}
        </h1>

        <div className="entra entra-5 mt-4">
          <Filigrana ancho={74} />
        </div>
        <p className="entra entra-5 mt-4 font-cinzel text-[12px] font-semibold uppercase leading-none tracking-[0.2em] text-[#5c3a80] md:text-[14px]">
          {fecha}
        </p>

        {frase && (
          <p className="entra entra-6 mt-5 max-w-[270px] font-display text-[17px] font-light italic leading-[1.55] text-muted text-pretty md:max-w-[340px] md:text-[20px]">
            {frase}
          </p>
        )}
      </div>

      {/* Pista de scroll: una portada de alto completo sin nada que
          indique que hay más abajo se lee como una página de una sola
          pantalla. */}
      <a
        href="#contenido"
        className="absolute bottom-[22px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[9px] uppercase leading-none tracking-[0.34em] text-[#8d6bab] no-underline"
      >
        Desliza
        <svg viewBox="0 0 14 14" className="baja h-3.5 w-3.5" aria-hidden>
          <path d="M2 5 l5 5 5-5" fill="none" stroke="#c08a2e" strokeWidth="1.4" />
        </svg>
      </a>
    </header>
  )
}
