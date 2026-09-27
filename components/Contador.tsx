'use client'
import { useEffect, useState } from 'react'

function diff(target: number) {
  const ms = Math.max(0, target - Date.now())
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor(ms / 3600000) % 24,
    m: Math.floor(ms / 60000) % 60,
    s: Math.floor(ms / 1000) % 60,
  }
}

/** Cuatro medallones de oro. */
export default function Contador({ fechaISO }: { fechaISO: string }) {
  const target = new Date(fechaISO).getTime()
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null)

  useEffect(() => {
    setT(diff(target))
    const id = setInterval(() => setT(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  // null en el primer render evita desajuste servidor/cliente
  const celdas: [string, number | null][] = [
    ['Días', t?.d ?? null],
    ['Horas', t?.h ?? null],
    ['Min', t?.m ?? null],
    ['Seg', t?.s ?? null],
  ]

  return (
    <div className="mx-auto grid max-w-[420px] grid-cols-4 gap-2.5">
      {celdas.map(([label, v]) => (
        <div key={label} className="medallon">
          <b className="font-display text-[28px] font-medium leading-none text-primary tabular-nums sm:text-[32px]">
            {v === null ? '–' : String(v).padStart(2, '0')}
          </b>
          <span className="mt-1 font-cinzel text-[8px] font-semibold uppercase tracking-[0.18em] text-[#9c7a3e]">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
