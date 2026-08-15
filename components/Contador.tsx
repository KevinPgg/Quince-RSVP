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
    ['días', t?.d ?? null],
    ['hrs', t?.h ?? null],
    ['min', t?.m ?? null],
    ['seg', t?.s ?? null],
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {celdas.map(([label, v]) => (
        <div key={label} className="tarjeta px-2 py-4 text-center">
          <div className="font-display text-3xl text-primary tabular-nums">
            {v === null ? '–' : String(v).padStart(2, '0')}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
