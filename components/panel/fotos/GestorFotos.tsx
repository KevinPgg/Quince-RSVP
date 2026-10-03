'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { arrayMove } from '@dnd-kit/sortable'
import Recortador, { type Recorte } from './Recortador'
import CarruselPanel, { PanelFotoActiva, type Modo } from './CarruselPanel'
import { EspejoDefs } from '@/components/EspejoAdornos'
import {
  subirFoto, reordenarFotos, guardarEspejo, repartirEspejos, guardarDetalles, borrarFoto,
  guardarColores, subirRetrato, quitarRetrato,
} from '@/app/admin/fotos/actions'
import { COLORES_ALBUM, espejosEfectivos, type FotoPanel, type NivelEspejo } from '@/config/galeria'
import { aRgb, colorEn, luminancia, LUMINANCIA_MINIMA, MAX_COLORES, MIN_COLORES } from '@/lib/colores'
import type { Resultado } from '@/lib/types'

/**
 * Panel de fotos. Todo vive en estado del cliente: cada cambio se
 * aplica al instante en pantalla (optimista) y se guarda en segundo
 * plano con una server action que NO revalida la ruta, así que la
 * página no se vuelve a pedir. Si el guardado falla, se deshace.
 */
type Estado = { tipo: 'guardando' } | { tipo: 'ok' } | { tipo: 'error'; texto: string } | null

function aFormData(r: Recorte) {
  const fd = new FormData()
  const ext = r.blob.type === 'image/webp' ? 'webp' : 'jpg'
  fd.set('archivo', new File([r.blob], `foto.${ext}`, { type: r.blob.type }))
  fd.set('ancho', String(r.ancho))
  fd.set('alto', String(r.alto))
  return fd
}

function Chip({ estado }: { estado: Estado }) {
  if (!estado) return null
  const base = 'rounded-full px-3 py-1 text-xs transition'
  if (estado.tipo === 'guardando') return <span className={`${base} bg-line/70 text-muted`}>Guardando…</span>
  if (estado.tipo === 'ok') return <span className={`${base} bg-green-50 text-green-700`}>Guardado ✓</span>
  return <span className={`${base} bg-red-50 text-red-700`}>{estado.texto}</span>
}

const MODOS: { id: Modo; nombre: string }[] = [
  { id: 'posicion', nombre: 'Posición' },
  { id: 'marcos', nombre: 'Marcos' },
  { id: 'detalles', nombre: 'Detalles' },
]

export default function GestorFotos({
  fotos: inicial, retrato: retratoInicial, retratoPropio: propioInicial, colores, coloresPropios, errorTabla,
}: {
  fotos: FotoPanel[]
  retrato: string
  retratoPropio: boolean
  colores: string[]
  coloresPropios: boolean
  errorTabla: string | null
}) {
  const [fotos, setFotos] = useState(inicial)
  const [activo, setActivo] = useState(0)
  const [modo, setModo] = useState<Modo>('posicion')
  const [estado, setEstado] = useState<Estado>(null)
  const [, iniciar] = useTransition()
  const [ocupado, setOcupado] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined)

  /** Aplica `nuevo` ya, guarda con `accion`, y vuelve a `previo` si falla. */
  const guardar = useCallback((previo: FotoPanel[], nuevo: FotoPanel[], accion: () => Promise<Resultado>) => {
    setFotos(nuevo)
    setEstado({ tipo: 'guardando' })
    setOcupado(true)
    iniciar(async () => {
      const r = await accion().catch((e: Error) => ({ ok: false as const, error: e.message }))
      setOcupado(false)
      if (r.ok) {
        setEstado({ tipo: 'ok' })
        clearTimeout(temporizador.current)
        temporizador.current = setTimeout(() => setEstado(null), 1800)
      } else {
        setFotos(previo)
        setEstado({ tipo: 'error', texto: r.error })
      }
    })
  }, [])

  const reordenar = useCallback((desde: number, hasta: number) => {
    const nuevo = arrayMove(fotos, desde, hasta)
    setActivo(hasta)
    guardar(fotos, nuevo, () => reordenarFotos(nuevo.map((f) => f.id)))
  }, [fotos, guardar])

  const niveles = espejosEfectivos(fotos)
  const actual = fotos[activo]

  // ---------------- Subida (cola con recorte) ----------------
  const [cola, setCola] = useState<File[]>([])
  const inputAlbum = useRef<HTMLInputElement>(null)

  async function subirRecorte(r: Recorte) {
    setEstado({ tipo: 'guardando' })
    const res = await subirFoto(aFormData(r))
    if (res.ok) {
      setFotos((fs) => {
        setActivo(fs.length)
        return [...fs, res.foto]
      })
      setEstado({ tipo: 'ok' })
    } else {
      setEstado({ tipo: 'error', texto: res.error })
    }
  }

  // ---------------- Retrato ----------------
  const [retrato, setRetrato] = useState(retratoInicial)
  const [retratoPropio, setRetratoPropio] = useState(propioInicial)
  const [archivoRetrato, setArchivoRetrato] = useState<File | null>(null)
  const [estadoRetrato, setEstadoRetrato] = useState<Estado>(null)
  const inputRetrato = useRef<HTMLInputElement>(null)

  async function cambiarRetrato(accion: () => Promise<{ ok: true; url: string } | { ok: false; error: string }>, propio: boolean) {
    setEstadoRetrato({ tipo: 'guardando' })
    const r = await accion()
    if (r.ok) { setRetrato(r.url); setRetratoPropio(propio); setEstadoRetrato({ tipo: 'ok' }) }
    else setEstadoRetrato({ tipo: 'error', texto: r.error })
  }

  // ---------------- Colores ----------------
  const [paleta, setPaleta] = useState<string[]>(colores)
  const [hayPropios, setHayPropios] = useState(coloresPropios)
  const [estadoColores, setEstadoColores] = useState<Estado>(null)
  const oscuros = paleta.filter((c) => luminancia(c) < LUMINANCIA_MINIMA)

  async function enviarColores(restaurar: boolean) {
    const fd = new FormData()
    if (restaurar) fd.set('restaurar', '1')
    else fd.set('colores', JSON.stringify(paleta))
    setEstadoColores({ tipo: 'guardando' })
    const r = await guardarColores(fd)
    if (r.ok) { setHayPropios(!restaurar); setEstadoColores({ tipo: 'ok' }); if (restaurar) setPaleta(COLORES_ALBUM) }
    else setEstadoColores({ tipo: 'error', texto: r.error })
  }

  // El fondo del carrusel del panel usa la misma paleta, en el punto de la foto activa.
  const [r, g, b] = colorEn(paleta.map(aRgb), fotos.length > 1 ? activo / (fotos.length - 1) : 0)

  const pestana = 'whitespace-nowrap rounded-full px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted transition focus:outline-none data-[selected]:bg-primary data-[selected]:text-white data-[hover]:text-ink data-[selected]:data-[hover]:text-white data-[focus]:ring-2 data-[focus]:ring-primary/40'

  return (
    <div className="space-y-5">
      <EspejoDefs />
      {errorTabla && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorTabla}</p>
      )}

      <TabGroup>
        <TabList className="flex w-max max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 [scrollbar-width:none]">
          <Tab className={pestana}>Carrusel</Tab>
          <Tab className={pestana}>Foto principal</Tab>
          <Tab className={pestana}>Colores</Tab>
        </TabList>

        <TabPanels className="mt-5">
          {/* ===================== CARRUSEL ===================== */}
          <TabPanel className="tarjeta overflow-hidden !px-0 focus:outline-none">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5">
              <div role="radiogroup" aria-label="Modo" className="flex gap-1 rounded-full bg-line/50 p-1">
                {MODOS.map((m) => (
                  <button
                    key={m.id} type="button" role="radio" aria-checked={modo === m.id}
                    onClick={() => setModo(m.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.1em] transition ${
                      modo === m.id ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-ink'
                    }`}
                  >{m.nombre}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Chip estado={estado} />
                <input
                  ref={inputAlbum} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) setCola(fs); e.target.value = '' }}
                />
                <button type="button" className="boton-primario !min-h-10" disabled={!!errorTabla} onClick={() => inputAlbum.current?.click()}>
                  + Subir fotos
                </button>
              </div>
            </div>

            {fotos.length === 0 ? (
              <p className="px-5 py-16 text-center text-sm text-muted">
                Aún no hay fotos en el álbum. Mientras tanto la portada muestra las del repo.
              </p>
            ) : (
              <>
                <div
                  className="mt-2"
                  style={{ background: `radial-gradient(70% 60% at 50% 45%, #fff9, transparent 70%), rgb(${r} ${g} ${b})`, '--tinte': `${r} ${g} ${b}` } as React.CSSProperties}
                >
                  <CarruselPanel fotos={fotos} modo={modo} activo={activo} onActivo={setActivo} onReordenar={reordenar} />
                </div>
                {actual && (
                  <div className="px-5 pt-5">
                    <PanelFotoActiva
                      modo={modo} foto={actual} indice={activo} total={fotos.length} nivel={niveles[activo]} ocupado={ocupado}
                      onMover={(d) => reordenar(activo, activo + d)}
                      onEspejo={(n: NivelEspejo) => guardar(fotos, fotos.map((f) => (f.id === actual.id ? { ...f, espejo: n } : f)), () => guardarEspejo(actual.id, n))}
                      onRepartir={() => {
                        const previo = fotos
                        setEstado({ tipo: 'guardando' })
                        setOcupado(true)
                        iniciar(async () => {
                          const res = await repartirEspejos()
                          setOcupado(false)
                          if (res.ok) {
                            setFotos((fs) => fs.map((f) => ({ ...f, espejo: res.niveles[f.id] ?? null })))
                            setEstado({ tipo: 'ok' })
                          } else { setFotos(previo); setEstado({ tipo: 'error', texto: res.error }) }
                        })
                      }}
                      onDetalles={(pie, visible) => {
                        const limpio = pie.trim().slice(0, 60)
                        guardar(fotos, fotos.map((f) => (f.id === actual.id ? { ...f, pie: limpio || null, visible } : f)), () => guardarDetalles(actual.id, limpio, visible))
                      }}
                      onBorrar={() => {
                        const id = actual.id
                        setActivo((a) => Math.max(0, Math.min(a, fotos.length - 2)))
                        guardar(fotos, fotos.filter((f) => f.id !== id), () => borrarFoto(id))
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </TabPanel>

          {/* ===================== FOTO PRINCIPAL ===================== */}
          <TabPanel className="tarjeta focus:outline-none">
            <h2 className="titulo-seccion text-xl">Foto principal</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              El círculo de la portada. Se recorta en cuadrado antes de subir.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <div className="aro-oro rounded-full p-[6px] shadow-[0_14px_34px_rgba(92,43,134,0.18)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={retrato} alt="Foto principal actual" className="h-32 w-32 rounded-full border-2 border-[#fdfaff] object-cover" />
              </div>
              <div className="flex flex-col items-start gap-2">
                <input
                  ref={inputRetrato} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setArchivoRetrato(f); e.target.value = '' }}
                />
                <button type="button" className="boton-primario" onClick={() => inputRetrato.current?.click()}>Cambiar foto principal</button>
                {retratoPropio && (
                  <button type="button" className="boton-borde" onClick={() => cambiarRetrato(() => quitarRetrato(), false)}>
                    Volver a la foto original
                  </button>
                )}
                <Chip estado={estadoRetrato} />
              </div>
            </div>
          </TabPanel>

          {/* ===================== COLORES ===================== */}
          <TabPanel className="tarjeta focus:outline-none">
            <h2 className="titulo-seccion text-xl">Colores del álbum</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              El fondo del carrusel pasa de un color al siguiente mientras se desliza: el primero es «de niña», el último «quinceañera».
              Los tonos muy oscuros no se aceptan porque el pie de foto y el oro dejarían de leerse.
            </p>
            <div className="mt-5 h-10 rounded-full ring-1 ring-line" style={{ background: `linear-gradient(90deg, ${paleta.join(', ')})` }} />
            <ol className="mt-4 flex flex-wrap gap-3">
              {paleta.map((c, i) => {
                const oscuro = luminancia(c) < LUMINANCIA_MINIMA
                return (
                  <li key={i} className={`flex items-center gap-2 rounded-2xl border p-2 ${oscuro ? 'border-red-300 bg-red-50' : 'border-line'}`}>
                    <input
                      type="color" value={c} aria-label={`Color ${i + 1}`}
                      onChange={(e) => setPaleta((p) => p.map((x, k) => (k === i ? e.target.value : x)))}
                      className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                    <span className="font-mono text-xs">{c}</span>
                    <button
                      type="button" aria-label="Quitar color" disabled={paleta.length <= MIN_COLORES}
                      onClick={() => setPaleta((p) => p.filter((_, k) => k !== i))}
                      className="h-7 w-7 rounded-full text-muted hover:bg-line disabled:opacity-30"
                    >×</button>
                  </li>
                )
              })}
              {paleta.length < MAX_COLORES && (
                <li>
                  <button type="button" className="boton-borde h-full !min-h-[52px]" onClick={() => setPaleta((p) => [...p, p[p.length - 1]])}>
                    + Color
                  </button>
                </li>
              )}
            </ol>
            {oscuros.length > 0 && <p className="mt-3 text-sm text-red-600">Aclara los colores marcados en rojo antes de guardar.</p>}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" className="boton-primario" disabled={oscuros.length > 0} onClick={() => enviarColores(false)}>Guardar colores</button>
              <button
                type="button" className="boton-borde"
                disabled={!hayPropios && paleta.join() === COLORES_ALBUM.join()}
                onClick={() => enviarColores(true)}
              >Restaurar por defecto</button>
              <Chip estado={estadoColores} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {archivoRetrato && (
        <Recortador
          archivo={archivoRetrato} proporcion={1} salidaAncho={800} circulo titulo="Encuadra la foto principal"
          onCancelar={() => setArchivoRetrato(null)}
          onListo={(rec) => { setArchivoRetrato(null); cambiarRetrato(() => subirRetrato(aFormData(rec)), true) }}
        />
      )}

      {cola[0] && (
        <Recortador
          key={`${cola[0].name}-${cola.length}`}
          archivo={cola[0]} proporcion={3 / 4} salidaAncho={900}
          titulo="Encuadra la foto en el espejo" restantes={cola.length - 1}
          onCancelar={() => setCola((c) => c.slice(1))}
          onListo={(rec) => { setCola((c) => c.slice(1)); subirRecorte(rec) }}
        />
      )}
    </div>
  )
}
