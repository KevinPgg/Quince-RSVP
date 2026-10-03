'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Recorte en el navegador antes de subir.
 *
 * Arrastrar mueve el encuadre; el deslizador acerca. Al confirmar se
 * dibuja en un canvas del tamaño final y se exporta a WebP, así que
 * al servidor llega una imagen de ~150-400 KB aunque la original
 * pese 8 MB. Eso evita el límite de cuerpo de las server actions y
 * ahorra datos móviles a los invitados.
 */
export type Recorte = { blob: Blob; ancho: number; alto: number }

export default function Recortador({
  archivo,
  proporcion,
  salidaAncho,
  circulo = false,
  titulo,
  restantes = 0,
  onListo,
  onCancelar,
}: {
  archivo: File
  /** ancho / alto */
  proporcion: number
  salidaAncho: number
  circulo?: boolean
  titulo: string
  restantes?: number
  onListo: (r: Recorte) => void
  onCancelar: () => void
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 }) // desplazamiento del centro, px del visor
  const [trabajando, setTrabajando] = useState(false)
  const arrastre = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  const VW = 300
  const VH = Math.round(VW / proporcion)

  useEffect(() => {
    const url = URL.createObjectURL(archivo)
    const i = new Image()
    i.onload = () => { setImg(i); setZoom(1); setPos({ x: 0, y: 0 }) }
    i.onerror = () => setError('El navegador no pudo abrir esta imagen. Si es HEIC de iPhone, compártela como JPG.')
    i.src = url
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  // Escala «cubrir»: la imagen llena el visor sin dejar huecos.
  const cubrir = img ? Math.max(VW / img.naturalWidth, VH / img.naturalHeight) : 1
  const escala = cubrir * zoom
  const w = img ? img.naturalWidth * escala : 0
  const h = img ? img.naturalHeight * escala : 0

  // Nunca dejar ver fondo vacío dentro del visor.
  function limitar(p: { x: number; y: number }, ww = w, hh = h) {
    const mx = Math.max(0, (ww - VW) / 2)
    const my = Math.max(0, (hh - VH) / 2)
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) }
  }

  function exportar() {
    if (!img) return
    setTrabajando(true)
    const salidaAlto = Math.round(salidaAncho / proporcion)
    const c = document.createElement('canvas')
    c.width = salidaAncho
    c.height = salidaAlto
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    // Rectángulo de la fuente que cae dentro del visor.
    const sw = VW / escala
    const sh = VH / escala
    const sx = img.naturalWidth / 2 - pos.x / escala - sw / 2
    const sy = img.naturalHeight / 2 - pos.y / escala - sh / 2
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, salidaAncho, salidaAlto)
    const terminar = (b: Blob | null) => {
      setTrabajando(false)
      if (b) onListo({ blob: b, ancho: salidaAncho, alto: salidaAlto })
      else setError('No se pudo preparar la imagen.')
    }
    c.toBlob((b) => {
      // Safari viejo no codifica WebP y devuelve PNG: mejor JPEG.
      if (b && b.type === 'image/webp') terminar(b)
      else c.toBlob(terminar, 'image/jpeg', 0.86)
    }, 'image/webp', 0.84)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="w-full max-w-sm rounded-3xl bg-surface p-5 shadow-2xl">
        <h3 className="titulo-seccion text-lg">{titulo}</h3>
        <p className="mt-1 text-xs text-muted">
          Arrastra para encuadrar y usa el deslizador para acercar.
          {restantes > 0 && ` Quedan ${restantes} más después de esta.`}
        </p>

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
        ) : (
          <div
            className="relative mx-auto mt-4 touch-none select-none overflow-hidden rounded-2xl bg-[#efe4f7]"
            style={{ width: VW, height: VH, maxWidth: '100%', cursor: 'grab' }}
            onPointerDown={(e) => {
              ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
              arrastre.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
            }}
            onPointerMove={(e) => {
              const a = arrastre.current
              if (!a) return
              setPos(limitar({ x: a.px + e.clientX - a.x, y: a.py + e.clientY - a.y }))
            }}
            onPointerUp={() => { arrastre.current = null }}
            onPointerCancel={() => { arrastre.current = null }}
          >
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
                style={{ width: w, height: h, transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
              />
            )}
            {/* Guía de la forma final: óvalo del espejo o círculo del retrato. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: '50%',
                boxShadow: '0 0 0 999px rgba(253,250,255,.55), inset 0 0 0 2px rgba(192,138,46,.9)',
              }}
            />
            {!circulo && <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/10" />}
          </div>
        )}

        {!error && (
          <label className="mt-4 block">
            <span className="etiqueta">Acercar</span>
            <input
              type="range" min={1} max={3} step={0.01} value={zoom}
              onChange={(e) => {
                const z = Number(e.target.value)
                setZoom(z)
                if (img) {
                  const s = cubrir * z
                  setPos((p) => limitar(p, img.naturalWidth * s, img.naturalHeight * s))
                }
              }}
              className="w-full accent-[rgb(var(--c-primary))]"
            />
          </label>
        )}

        <div className="mt-5 flex gap-3">
          <button type="button" className="boton-borde flex-1" onClick={onCancelar} disabled={trabajando}>
            {restantes > 0 ? 'Saltar' : 'Cancelar'}
          </button>
          <button type="button" className="boton-primario flex-1" onClick={exportar} disabled={!img || trabajando || !!error}>
            {trabajando ? 'Preparando…' : 'Usar este encuadre'}
          </button>
        </div>
      </div>
    </div>
  )
}
