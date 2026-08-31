import Image from 'next/image'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Filigrana from '@/components/Filigrana'
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
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-8 text-center">
      {/* Castillo al pie, igual que en la portada. */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-full max-w-2xl -translate-x-1/2 opacity-40 [mask-image:linear-gradient(to_top,#000_38%,transparent_92%)]">
        <Image
          src="/recursos/tema/castillo.png"
          alt=""
          width={1137}
          height={620}
          priority
          sizes="(min-width: 672px) 672px, 100vw"
          className="h-auto w-full"
        />
      </div>

      <div className="relative aparece">
        {/* Corona dibujada, no la PNG: aquí es un gesto animado y conviene
            que sea vectorial para que el vaivén no se vea pixelado. */}
        <svg
          width="56"
          height="36"
          viewBox="0 0 150 96"
          fill="none"
          aria-hidden
          className="vaiven mx-auto"
        >
          <path
            d="M14 84 L26 30 L50 58 L75 14 L100 58 L124 30 L136 84 Z"
            fill="#eed9a4"
            stroke="#b07d24"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M14 84 H136" stroke="#b07d24" strokeWidth="8" strokeLinecap="round" />
          <circle cx="75" cy="10" r="9" fill="#c2417d" stroke="#b07d24" strokeWidth="3" />
        </svg>

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
