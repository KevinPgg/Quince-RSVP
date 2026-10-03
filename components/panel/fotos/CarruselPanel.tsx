'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Switch } from '@headlessui/react'
import Espejo from '@/components/Espejo'
import SelectorEspejo from './SelectorEspejo'
import { ESPEJOS, espejosEfectivos, type FotoPanel, type NivelEspejo } from '@/config/galeria'

export type Modo = 'posicion' | 'marcos' | 'detalles'

const ANCHO = 150 // ancho del espejo en el carrusel del panel
const PASO = ANCHO + 10

/**
 * Carrusel 3D del panel.
 *
 * - El efecto 3D (giro y profundidad según la distancia al centro) se
 *   escribe directo en variables CSS dentro de un requestAnimationFrame:
 *   React no vuelve a renderizar al deslizar.
 * - Cada espejo tiene dos caras. En «Posición» se voltean y se ven de
 *   espaldas (número + camafeo de la foto): ahí se arrastran con
 *   dnd-kit. En «Marcos» y «Detalles» se ven de frente y quedan fijos.
 * - El giro va en `perspective()` de cada espejo y no en `perspective`
 *   del contenedor: en un contenedor con scroll el punto de fuga se
 *   queda pegado al contenido y los del final se deforman.
 */
export default function CarruselPanel({
  fotos,
  modo,
  activo,
  onActivo,
  onReordenar,
}: {
  fotos: FotoPanel[]
  modo: Modo
  activo: number
  onActivo: (i: number) => void
  onReordenar: (desde: number, hasta: number) => void
}) {
  const tiraRef = useRef<HTMLDivElement>(null)
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const niveles = espejosEfectivos(fotos)
  const activoRef = useRef(activo)
  activoRef.current = activo

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // En el celular deslizar es scroll; mantener presionado es arrastrar.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const pintar = useCallback(() => {
    const tira = tiraRef.current
    if (!tira) return
    const centro = tira.scrollLeft + tira.clientWidth / 2
    let mejor = 0
    let dist = Infinity
    tira.querySelectorAll<HTMLElement>('[data-c3d]').forEach((el, i) => {
      const d = (el.offsetLeft + el.offsetWidth / 2 - centro) / PASO
      const a = Math.min(3, Math.abs(d))
      el.style.setProperty('--ry', `${Math.max(-58, Math.min(58, -d * 34))}deg`)
      el.style.setProperty('--tz', `${-a * 70}px`)
      el.style.setProperty('--op', `${Math.max(0.35, 1 - a * 0.22)}`)
      el.style.zIndex = String(100 - Math.round(a * 10))
      if (Math.abs(d) < dist) { dist = Math.abs(d); mejor = i }
    })
    if (mejor !== activoRef.current) onActivo(mejor)
  }, [onActivo])

  useEffect(() => {
    const tira = tiraRef.current
    if (!tira) return
    let cuadro = 0
    const alScroll = () => { if (!cuadro) cuadro = requestAnimationFrame(() => { cuadro = 0; pintar() }) }
    tira.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => {
      tira.removeEventListener('scroll', alScroll)
      window.removeEventListener('resize', alScroll)
      if (cuadro) cancelAnimationFrame(cuadro)
    }
  }, [pintar])

  // Tras cualquier cambio de la lista (orden, alta, baja) recalcular el 3D.
  useLayoutEffect(() => { pintar() }, [fotos, pintar])

  const centrar = useCallback((i: number, suave = true) => {
    const tira = tiraRef.current
    const el = tira?.querySelectorAll<HTMLElement>('[data-c3d]')[i]
    if (!tira || !el) return
    tira.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - tira.clientWidth / 2, behavior: suave ? 'smooth' : 'instant' })
  }, [])

  // Si el padre cambia el activo (botones ← →, foto nueva), llevarlo al centro.
  useEffect(() => {
    const tira = tiraRef.current
    const el = tira?.querySelectorAll<HTMLElement>('[data-c3d]')[activo]
    if (!tira || !el) return
    const desfase = el.offsetLeft + el.offsetWidth / 2 - (tira.scrollLeft + tira.clientWidth / 2)
    if (Math.abs(desfase) > PASO / 2) centrar(activo)
  }, [activo, fotos.length, centrar])

  function alSoltar(e: DragEndEvent) {
    setArrastrando(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const desde = fotos.findIndex((f) => f.id === active.id)
    const hasta = fotos.findIndex((f) => f.id === over.id)
    if (desde >= 0 && hasta >= 0) onReordenar(desde, hasta)
  }

  const fotoArrastrada = arrastrando ? fotos.find((f) => f.id === arrastrando) : null
  const iArrastrada = fotoArrastrada ? fotos.indexOf(fotoArrastrada) : -1

  return (
    <div className="carrusel-panel relative">
      <DndContext
        sensors={sensores}
        collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => setArrastrando(String(e.active.id))}
        onDragEnd={alSoltar}
        onDragCancel={() => setArrastrando(null)}
      >
        <SortableContext items={fotos.map((f) => f.id)} strategy={horizontalListSortingStrategy}>
          <div
            ref={tiraRef}
            className="carrusel-panel-tira flex gap-[10px] overflow-x-auto pb-6 pt-[64px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: arrastrando ? 'none' : 'x mandatory' }}
          >
            <span aria-hidden className="shrink-0" style={{ flexBasis: `calc(50% - ${ANCHO / 2 + 10}px)` }} />
            {fotos.map((f, i) => (
              <ItemCarrusel
                key={f.id}
                foto={f}
                indice={i}
                nivel={niveles[i]}
                volteado={modo === 'posicion'}
                arrastrable={modo === 'posicion'}
                activo={i === activo}
                onClick={() => centrar(i)}
              />
            ))}
            <span aria-hidden className="shrink-0" style={{ flexBasis: `calc(50% - ${ANCHO / 2 + 10}px)` }} />
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }}>
          {fotoArrastrada && (
            <div className="carrusel-panel-levantado">
              <Espejo nivel={niveles[iArrastrada]} src={fotoArrastrada.src} ancho={ANCHO} dorso numero={iArrastrada + 1} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function ItemCarrusel({
  foto, indice, nivel, volteado, arrastrable, activo, onClick,
}: {
  foto: FotoPanel
  indice: number
  nivel: NivelEspejo
  volteado: boolean
  arrastrable: boolean
  activo: boolean
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: foto.id,
    disabled: !arrastrable,
  })

  return (
    <div
      ref={setNodeRef}
      data-c3d
      className="relative shrink-0"
      style={{
        width: ANCHO,
        scrollSnapAlign: 'center',
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : undefined,
        touchAction: arrastrable ? 'manipulation' : undefined,
        cursor: arrastrable ? 'grab' : 'pointer',
      }}
      {...(arrastrable ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
      aria-label={`Foto ${indice + 1}${foto.pie ? `: ${foto.pie}` : ''}${foto.visible ? '' : ' (oculta)'}`}
      aria-current={activo ? 'true' : undefined}
    >
      <div className="c3d-cara">
        <div className={`c3d-volteo ${volteado ? 'esta-volteado' : ''}`}>
          <div className={`c3d-frente ${foto.visible ? '' : 'esta-oculta'}`}>
            <Espejo nivel={nivel} src={foto.src} ancho={ANCHO} />
          </div>
          <div className="c3d-dorso">
            <Espejo nivel={nivel} src={foto.src} ancho={ANCHO} dorso numero={indice + 1} />
          </div>
        </div>
      </div>
      {!foto.visible && (
        <span className="absolute left-1/2 top-[45%] z-[200] -translate-x-1/2 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
          Oculta
        </span>
      )}
    </div>
  )
}

/** Controles de la foto activa, según el modo. */
export function PanelFotoActiva({
  modo, foto, indice, total, nivel, ocupado,
  onMover, onEspejo, onRepartir, onDetalles, onBorrar,
}: {
  modo: Modo
  foto: FotoPanel
  indice: number
  total: number
  nivel: NivelEspejo
  ocupado: boolean
  onMover: (d: -1 | 1) => void
  onEspejo: (n: NivelEspejo) => void
  onRepartir: () => void
  onDetalles: (pie: string, visible: boolean) => void
  onBorrar: () => void
}) {
  const [confirmarRepartir, setConfirmarRepartir] = useState(false)
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)
  const [pie, setPie] = useState(foto.pie ?? '')
  useEffect(() => { setPie(foto.pie ?? ''); setConfirmarBorrar(false) }, [foto.id, foto.pie])

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-line bg-surface/80 p-4 shadow-sm">
      <p className="text-center text-xs uppercase tracking-[0.14em] text-muted">
        Foto {indice + 1} de {total}{foto.pie ? ` · ${foto.pie}` : ''}
      </p>

      {modo === 'posicion' && (
        <>
          <p className="text-center text-sm text-muted">
            Arrastra un espejo para cambiarlo de lugar. En el celular, mantenlo presionado un momento.
          </p>
          <div className="flex justify-center gap-2">
            <button type="button" className="boton-borde !min-h-10" disabled={ocupado || indice === 0} onClick={() => onMover(-1)}>← Antes</button>
            <button type="button" className="boton-borde !min-h-10" disabled={ocupado || indice === total - 1} onClick={() => onMover(1)}>Después →</button>
          </div>
        </>
      )}

      {modo === 'marcos' && (
        <>
          <SelectorEspejo valor={nivel} src={foto.src} onCambio={onEspejo} deshabilitado={ocupado} />
          {foto.espejo === null && (
            <p className="text-center text-xs text-muted">
              Asignado por posición. Al elegir uno queda fijo en esta foto.
            </p>
          )}
          <div className="border-t border-line pt-4 text-center">
            {confirmarRepartir ? (
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" className="boton-primario !min-h-10" disabled={ocupado} onClick={() => { setConfirmarRepartir(false); onRepartir() }}>
                  Sí, repartir en todas
                </button>
                <button type="button" className="boton-borde !min-h-10" onClick={() => setConfirmarRepartir(false)}>No</button>
              </div>
            ) : (
              <button type="button" className="boton-borde !min-h-10" disabled={ocupado} onClick={() => setConfirmarRepartir(true)}>
                Repartir automáticamente
              </button>
            )}
            <p className="mt-2 text-xs text-muted">Reparte los {ESPEJOS.length} espejos por partes iguales entre las fotos visibles.</p>
          </div>
        </>
      )}

      {modo === 'detalles' && (
        <>
          <label className="block">
            <span className="etiqueta">Pie de foto (opcional)</span>
            <div className="flex gap-2">
              <input
                value={pie}
                onChange={(e) => setPie(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onDetalles(pie, foto.visible) }}
                maxLength={60}
                placeholder="Ej. Navidades"
                className="campo flex-1"
              />
              <button
                type="button" className="boton-primario !min-h-11 !px-4"
                disabled={ocupado || pie.trim() === (foto.pie ?? '')}
                onClick={() => onDetalles(pie, foto.visible)}
              >Guardar</button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">Visible en el álbum</span>
            <Switch
              checked={foto.visible}
              onChange={(v) => onDetalles(foto.pie ?? '', v)}
              disabled={ocupado}
              className="group relative inline-flex h-7 w-12 items-center rounded-full bg-line transition data-[checked]:bg-primary data-[disabled]:opacity-50"
            >
              <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition group-data-[checked]:translate-x-6" />
            </Switch>
          </div>

          <div className="border-t border-line pt-4 text-center">
            {confirmarBorrar ? (
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" className="boton !min-h-10 bg-red-600 text-white" disabled={ocupado} onClick={onBorrar}>Sí, borrar esta foto</button>
                <button type="button" className="boton-borde !min-h-10" onClick={() => setConfirmarBorrar(false)}>No</button>
              </div>
            ) : (
              <button type="button" className="text-sm text-red-600 underline-offset-4 hover:underline" onClick={() => setConfirmarBorrar(true)}>
                Borrar foto
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
