import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Filigrana from '@/components/Filigrana'
import { Brillos, Corona } from '@/components/tema/Ornamentos'
import type { Invitado } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Gracias({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Se relee la respuesta para poder decir cuántos lugares confirmó, como
  // en el tablero 5b. Si algo falla, el texto cae al genérico: esta pantalla
  // nunca debe romperse, ya se guardó lo importante.
  let confirmados: number | null = null
  let asiste: boolean | null = null
  try {
    const db = supabaseAdmin()
    const { data: invitado } = await db
      .from('invitados')
      .select('id')
      .eq('token', token)
      .is('eliminado_en', null)
      .maybeSingle<Pick<Invitado, 'id'>>()

    if (invitado) {
      const { data } = await db
        .from('rsvp')
        .select('asiste, pases_confirmados')
        .eq('invitado_id', invitado.id)
        .order('respondido_en', { ascending: false })
        .limit(1)
        .maybeSingle<{ asiste: boolean; pases_confirmados: number }>()
      if (data) {
        asiste = data.asiste
        confirmados = data.pases_confirmados
      }
    }
  } catch {
    // Sin detalle; el mensaje genérico basta.
  }

  return (
    <main className="portada-alto relative isolate flex flex-col pb-[220px] pt-12 items-center justify-center overflow-hidden px-8 text-center">
      {/* Castillo al pie como máscara, igual que en la portada. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          WebkitMask: 'linear-gradient(0deg, transparent 0, #000 120px)',
          mask: 'linear-gradient(0deg, transparent 0, #000 120px)',
        }}
      >
        <div className="castillo w-[min(100%,560px)] opacity-60" />
      </div>
      <Brillos
        lista={[
          { left: '14%', top: '14%' },
          { left: '84%', top: '20%', tipo: 'lila' },
          { left: '20%', top: '46%', tipo: 'estrella' },
          { left: '78%', top: '40%', tipo: 'rosa' },
        ]}
      />

      <div className="relative aparece">
        <Corona className="vaiven mx-auto block h-12 w-[70px] drop-shadow-[0_3px_6px_rgba(160,110,30,0.28)]" />

        <h1
          className="mt-2.5 font-firma text-[46px] leading-[1.1] text-[#b52272]"
          style={{ paddingTop: '0.1em' }}
        >
          {asiste === false ? 'Te vamos a extrañar' : '¡Nos vemos ahí!'}
        </h1>

        <div className="mt-4">
          <Filigrana ancho={64} />
        </div>

        <p className="mx-auto mt-4 max-w-[300px] text-[13px] leading-[1.7] text-muted text-pretty">
          {asiste === false
            ? 'Registramos tu respuesta. Guarda tu enlace: puedes volver a abrirlo si cambian los planes.'
            : confirmados !== null
              ? `Confirmaste ${confirmados} ${confirmados === 1 ? 'lugar' : 'lugares'}. Guarda tu enlace: puedes volver a abrirlo para cambiar la respuesta.`
              : 'Tu respuesta quedó registrada. Guarda tu enlace: puedes volver a abrirlo para cambiar la respuesta.'}
        </p>

        <Link href={`/i/${token}`} className="boton-oro mt-6">
          Volver a la invitación
        </Link>
      </div>
    </main>
  )
}
