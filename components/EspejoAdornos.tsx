import type { NivelEspejo } from '@/config/galeria'

/**
 * Ornamentos SVG de los cinco espejos del álbum.
 *
 * Geometría: el SVG mide 300×380 unidades y se monta 40 a la izquierda
 * y 50 arriba de un óvalo de 220×293. Todo va en porcentajes del
 * espejo (globals.css), así que el mismo dibujo sirve a 220 px en la
 * portada y a 64 px en el selector del panel. Centro: (150, 196.7).
 *
 * Luz única desde arriba a la izquierda en todo: el reflejo de las
 * perlas, el brillo de las joyas y el bisel del oro la comparten, o
 * el conjunto se lee como pegado.
 *
 * Los degradados y piezas viven en <EspejoDefs/>, que se monta UNA
 * vez por página: un id repetido en el documento es HTML inválido y
 * Safari toma el primero que encuentra.
 */

// Perlas incrustadas EN el marco, no alrededor: van centradas sobre la
// banda de oro, con diámetro menor que su ancho. Fuera del óvalo se
// leían más grandes que el propio marco.
//   fino:  niveles 2-3, banda de 9 px  → elipse rx 105.5, ry 142.2, r 2.9
//   canal: niveles 4-5, banda de 13 px → elipse rx 103.5, ry 140.2, r 3.5
// Precalculadas a igual longitud de arco: con Math.cos en render,
// servidor y navegador pueden diferir en el último decimal y React
// tira error de hidratación.
const PERLAS_FINO: [number, number][] = [[150.0,54.5],[157.3,54.8],[164.5,55.9],[171.7,57.5],[178.6,59.8],[185.3,62.7],[191.8,66.1],[197.9,70.0],[203.8,74.4],[209.4,79.1],[214.6,84.3],[219.5,89.7],[224.0,95.4],[228.3,101.4],[232.2,107.5],[235.8,113.9],[239.0,120.4],[242.0,127.1],[244.7,133.9],[247.0,140.9],[249.1,147.9],[250.9,155.0],[252.3,162.1],[253.5,169.4],[254.4,176.6],[255.1,183.9],[255.4,191.2],[255.5,198.5],[255.3,205.8],[254.8,213.1],[254.0,220.4],[253.0,227.6],[251.6,234.8],[250.0,242.0],[248.1,249.0],[245.9,255.9],[243.4,262.8],[240.6,269.6],[237.5,276.2],[234.0,282.7],[230.3,288.9],[226.2,295.0],[221.8,300.8],[217.1,306.4],[212.0,311.7],[206.6,316.7],[200.9,321.2],[194.9,325.4],[188.6,329.0],[182.0,332.2],[175.2,334.8],[168.1,336.8],[161.0,338.1],[153.7,338.8],[146.4,338.8],[139.1,338.1],[131.9,336.8],[124.9,334.8],[118.0,332.2],[111.4,329.1],[105.1,325.4],[99.1,321.2],[93.4,316.7],[88.0,311.7],[82.9,306.5],[78.2,300.9],[73.8,295.0],[69.7,289.0],[66.0,282.7],[62.6,276.3],[59.4,269.6],[56.6,262.9],[54.1,256.0],[51.9,249.0],[50.0,242.0],[48.4,234.9],[47.0,227.7],[46.0,220.4],[45.2,213.1],[44.7,205.9],[44.5,198.5],[44.6,191.3],[44.9,183.9],[45.6,176.7],[46.5,169.4],[47.7,162.2],[49.1,155.0],[50.9,147.9],[53.0,140.9],[55.3,134.0],[58.0,127.2],[60.9,120.5],[64.2,114.0],[67.8,107.6],[71.7,101.4],[75.9,95.4],[80.5,89.7],[85.4,84.3],[90.6,79.2],[96.2,74.4],[102.0,70.0],[108.2,66.1],[114.7,62.7],[121.4,59.8],[128.3,57.5],[135.4,55.9],[142.7,54.8]]
const PERLAS_CANAL: [number, number][] = [[150.0,56.5],[158.6,57.0],[167.2,58.4],[175.5,60.8],[183.5,64.0],[191.1,68.0],[198.4,72.8],[205.2,78.1],[211.5,84.0],[217.4,90.3],[222.8,97.1],[227.8,104.2],[232.2,111.6],[236.3,119.2],[239.8,127.1],[243.0,135.1],[245.7,143.4],[248.0,151.7],[249.9,160.1],[251.4,168.7],[252.5,177.3],[253.2,185.9],[253.5,194.5],[253.4,203.2],[252.9,211.8],[252.0,220.4],[250.7,229.0],[249.0,237.5],[246.9,245.8],[244.4,254.1],[241.5,262.3],[238.1,270.2],[234.3,278.0],[230.1,285.5],[225.4,292.8],[220.2,299.7],[214.6,306.3],[208.4,312.4],[201.9,318.0],[194.8,323.1],[187.4,327.4],[179.5,331.1],[171.4,333.9],[162.9,335.8],[154.3,336.8],[145.7,336.8],[137.1,335.8],[128.7,333.9],[120.5,331.1],[112.7,327.5],[105.2,323.1],[98.2,318.0],[91.6,312.4],[85.5,306.3],[79.8,299.7],[74.6,292.8],[69.9,285.6],[65.7,278.0],[61.9,270.3],[58.5,262.3],[55.6,254.2],[53.1,245.9],[51.0,237.5],[49.3,229.0],[48.0,220.5],[47.1,211.9],[46.6,203.2],[46.5,194.5],[46.8,185.9],[47.5,177.3],[48.6,168.7],[50.1,160.2],[52.0,151.7],[54.3,143.4],[57.0,135.2],[60.1,127.1],[63.7,119.2],[67.7,111.6],[72.2,104.2],[77.2,97.1],[82.6,90.3],[88.4,84.0],[94.8,78.1],[101.6,72.8],[108.8,68.1],[116.5,64.0],[124.5,60.8],[132.8,58.4],[141.4,57.0]]

/** Joya con su resplandor de color sobre el oro. */
function Joya({ x, y, r, lila = false }: { x: number; y: number; r: number; lila?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.6} fill={`url(#esp-halo-${lila ? 'lila' : 'rosa'})`} />
      <circle cx={x + 0.6} cy={y + 0.9} r={r} fill="rgba(70,30,10,.45)" />
      <circle cx={x} cy={y} r={r} fill={`url(#esp-joya-${lila ? 'lila' : 'rosa'})`} stroke="#7a4f12" strokeWidth=".6" />
      <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.28} fill="#fff" opacity=".85" />
    </g>
  )
}

export function EspejoDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {/* Oro biselado: luz, base y sombra bronce alternadas. */}
        <linearGradient id="esp-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".18" stopColor="#d9a845" />
          <stop offset=".34" stopColor="#8a5a14" />
          <stop offset=".5" stopColor="#f6dc8e" />
          <stop offset=".66" stopColor="#b9852b" />
          <stop offset=".82" stopColor="#fff0c0" />
          <stop offset="1" stopColor="#7a4f12" />
        </linearGradient>
        <radialGradient id="esp-perla" cx=".32" cy=".28" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor="#fbf6f2" />
          <stop offset=".75" stopColor="#e6d9d2" />
          <stop offset="1" stopColor="#b8a49c" />
        </radialGradient>
        <radialGradient id="esp-joya-rosa" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffd6ea" />
          <stop offset=".45" stopColor="#d23d86" />
          <stop offset="1" stopColor="#6e0d40" />
        </radialGradient>
        <radialGradient id="esp-joya-lila" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#f3e2ff" />
          <stop offset=".45" stopColor="#9555cc" />
          <stop offset="1" stopColor="#40176a" />
        </radialGradient>
        <radialGradient id="esp-halo-rosa">
          <stop offset="0" stopColor="#ff5fa8" stopOpacity=".55" />
          <stop offset="1" stopColor="#ff5fa8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="esp-halo-lila">
          <stop offset="0" stopColor="#b678ff" stopOpacity=".5" />
          <stop offset="1" stopColor="#b678ff" stopOpacity="0" />
        </radialGradient>

        {/* Collares: sombra de contacto + esfera con reflejo arriba-izquierda. */}
        {([['esp-perlas-fino', PERLAS_FINO, 2.9], ['esp-perlas-canal', PERLAS_CANAL, 3.5]] as const).map(([id, lista, r]) => (
          <g id={id} key={id}>
            {lista.map(([x, y], i) => (
              <circle key={`s${i}`} cx={x + 0.5} cy={y + 0.8} r={r} fill="rgba(70,40,10,.4)" />
            ))}
            {lista.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="url(#esp-perla)" />
            ))}
          </g>
        ))}

        <g id="esp-lazo">
          <path d="M150 50 C140 37 125 37 125 47 C125 56 138 55 150 50Z" fill="url(#esp-oro)" stroke="#7a4f12" strokeWidth=".8" />
          <path d="M150 50 C160 37 175 37 175 47 C175 56 162 55 150 50Z" fill="url(#esp-oro)" stroke="#7a4f12" strokeWidth=".8" />
          <path d="M147 52 L141 64 M153 52 L159 64" stroke="#b9852b" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        {/* Cresta rococó: dos volutas en C y una concha. */}
        <g id="esp-cresta">
          <g fill="none" strokeLinecap="round">
            <path d="M150 54 C138 54 128 46 122 36 C116 26 104 26 102 34 C100 41 108 44 112 39" stroke="#6b430e" strokeWidth="6.4" transform="translate(.8 1.2)" opacity=".35" />
            <path d="M150 54 C162 54 172 46 178 36 C184 26 196 26 198 34 C200 41 192 44 188 39" stroke="#6b430e" strokeWidth="6.4" transform="translate(.8 1.2)" opacity=".35" />
            <path d="M150 54 C138 54 128 46 122 36 C116 26 104 26 102 34 C100 41 108 44 112 39" stroke="url(#esp-oro)" strokeWidth="5.4" />
            <path d="M150 54 C162 54 172 46 178 36 C184 26 196 26 198 34 C200 41 192 44 188 39" stroke="url(#esp-oro)" strokeWidth="5.4" />
            <path d="M149 52 C138 51 129 44 123.5 35" stroke="#fff6d6" strokeWidth="1.1" opacity=".8" />
            <path d="M151 52 C162 51 171 44 176.5 35" stroke="#fff6d6" strokeWidth="1.1" opacity=".8" />
          </g>
          <path d="M150 52 L132 32 Q150 14 168 32 Z" fill="url(#esp-oro)" stroke="#7a4f12" strokeWidth=".8" strokeLinejoin="round" />
          <path d="M150 52 L141 24 M150 52 L150 20 M150 52 L159 24 M150 52 L135 29 M150 52 L165 29" stroke="#7a4f12" strokeWidth=".7" opacity=".7" />
        </g>

        <g id="esp-remate">
          <path d="M150 342 C134 342 122 348 116 354 M150 342 C166 342 178 348 184 354" fill="none" stroke="url(#esp-oro)" strokeWidth="3.8" strokeLinecap="round" />
          <path d="M150 340 C140 344 136 352 142 358 C146 362 150 366 150 372 C150 366 154 362 158 358 C164 352 160 344 150 340Z" fill="url(#esp-oro)" stroke="#7a4f12" strokeWidth=".8" />
        </g>

        <g id="esp-voluta">
          <g fill="none" strokeLinecap="round">
            <path d="M40 196 C26 180 26 160 36 150 C44 142 54 148 50 156 C47 162 40 160 41 154" stroke="url(#esp-oro)" strokeWidth="4.8" />
            <path d="M40 196 C26 212 26 232 36 242 C44 250 54 244 50 236 C47 230 40 232 41 238" stroke="url(#esp-oro)" strokeWidth="4.8" />
            <path d="M38 193 C27 180 27 162 36 152" stroke="#fff6d6" strokeWidth="1" opacity=".75" />
          </g>
          <path d="M40 196 C32 190 22 192 18 198 C22 204 32 204 40 196Z" fill="url(#esp-oro)" stroke="#7a4f12" strokeWidth=".7" />
        </g>

        <g id="esp-corona">
          <path d="M120 22 L114 -8 L130 6 L140 -16 L150 2 L160 -16 L170 6 L186 -8 L180 22 Z"
                fill="url(#esp-oro)" stroke="#7a4f12" strokeWidth="1" strokeLinejoin="round" />
          <path d="M123 19 L119 -2 L131 9 L140 -9 L150 6 L160 -9 L169 9 L181 -2 L177 19" fill="none" stroke="#fff3c4" strokeWidth=".9" opacity=".7" strokeLinejoin="round" />
          <rect x="118" y="20" width="64" height="9" rx="2.5" fill="url(#esp-oro)" stroke="#7a4f12" strokeWidth="1" />
          {[[114, -10], [186, -10], [140, -18], [160, -18]].map(([x, y]) => (
            <g key={x}>
              <circle cx={x + 0.7} cy={y + 1} r={3.6} fill="rgba(80,50,70,.3)" />
              <circle cx={x} cy={y} r={3.6} fill="url(#esp-perla)" />
            </g>
          ))}
        </g>
      </defs>
    </svg>
  )
}

export function EspejoAdornos({ nivel }: { nivel: NivelEspejo }) {
  return (
    <svg className="espejo-adornos" viewBox="0 0 300 380" aria-hidden>
      {(nivel === 2 || nivel === 3) && <use href="#esp-perlas-fino" />}
      {nivel >= 4 && <use href="#esp-perlas-canal" />}
      {nivel <= 2 && (
        <>
          <use href="#esp-lazo" />
          <Joya x={150} y={50} r={4} />
        </>
      )}
      {nivel >= 3 && (
        <>
          <use href="#esp-cresta" />
          <Joya x={150} y={52} r={5} />
          <use href="#esp-remate" />
          <Joya x={150} y={353} r={3.6} lila />
        </>
      )}
      {nivel >= 4 && (
        <>
          <use href="#esp-voluta" />
          <use href="#esp-voluta" transform="translate(300 0) scale(-1 1)" />
          <Joya x={40} y={196} r={4.2} />
          <Joya x={260} y={196} r={4.2} />
        </>
      )}
      {nivel === 5 && (
        <g transform="translate(0 -6)">
          <use href="#esp-corona" />
          <path d="M150 -2 l5 9 -5 9 -5 -9z" fill="url(#esp-joya-rosa)" stroke="#7a4f12" strokeWidth=".5" />
          <Joya x={132} y={24.5} r={2.4} lila />
          <Joya x={150} y={24.5} r={2.8} />
          <Joya x={168} y={24.5} r={2.4} lila />
        </g>
      )}
    </svg>
  )
}
