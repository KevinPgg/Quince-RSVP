import Revelar from '@/components/Revelar'
import { Corona, Esquinas } from '@/components/tema/Ornamentos'
import Mariposa from '@/components/tema/Mariposa'

/**
 * Tarjeta de la sección «Mesa de regalos», compartida entre la portada y
 * la invitación. La primera línea del texto es el encabezado de la tarjeta
 * (misma letra que los títulos de tarjeta); el resto son párrafos.
 *
 * La corona llena el hueco que deja el arco en la parte de arriba, igual
 * que en la tarjeta de «¿Tienes tu invitación?».
 */
export default function MesaRegalos({ texto }: { texto: string | null }) {
  const [encabezado, ...parrafos] = (texto ?? '').split(/\r?\n/).map((p) => p.trim()).filter(Boolean)
  if (!encabezado) return null
  return (
    <Revelar>
      <div className="tarjeta-real arco">
        <Esquinas donde="abajo" />
        {/* Posada en el hombro del arco. */}
        <Mariposa ancho={30} tono="lila" vuelo="posada" giro={28} className="right-[9%] top-[13px] z-[2]" />
        <Corona className="mx-auto mb-2.5 block h-[34px] w-12" />
        <p className="text-balance font-display text-[26px] leading-tight text-ink">{encabezado}</p>
        {parrafos.length > 0 && (
          <div className="mx-auto mt-3 max-w-[34ch] space-y-2.5">
            {parrafos.map((p, i) => (
              <p key={i} className="text-balance text-[14.5px] leading-[1.75] text-muted">{p}</p>
            ))}
          </div>
        )}
      </div>
    </Revelar>
  )
}
