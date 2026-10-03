'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Música de fondo de la portada con botón de silencio en la esquina.
 *
 * Los navegadores NO dejan sonar audio hasta que la persona toca la
 * página. Por eso: se intenta reproducir al cargar, y si el navegador
 * lo bloquea, la canción arranca con el primer toque, clic o tecla en
 * cualquier parte. El scroll no cuenta como interacción, así que quien
 * solo desliza no la oirá hasta tocar algo.
 *
 * - `preload="none"`: no se descarga nada (≈2 MB) hasta que va a sonar.
 *   La mitad de los invitados abre el link con datos móviles.
 * - Silenciar PAUSA (no solo baja el volumen): deja de gastar datos.
 *   La elección se recuerda en este navegador.
 * - Al cambiar de pestaña o bloquear el teléfono se pausa, y vuelve al
 *   regresar si estaba sonando.
 * - Dos fuentes: WebM/Opus (más liviana) y AAC para Safari viejo.
 */
const CLAVE = 'quince:musica'

export default function Musica() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)
  const [suena, setSuena] = useState(false)
  const quiereRef = useRef(true) // la persona quiere música (no la silenció)

  async function reproducir() {
    const a = audioRef.current
    if (!a) return false
    try {
      a.volume = 0
      await a.play()
      // Entrada suave. iOS ignora `volume`: ahí arranca a volumen normal.
      const inicio = performance.now()
      const subir = (t: number) => {
        // El sello del primer cuadro puede ser anterior a `inicio`: acotar a [0, 1].
        const k = Math.max(0, Math.min(1, (t - inicio) / 1500))
        a.volume = 0.6 * k
        if (k < 1 && !a.paused) requestAnimationFrame(subir)
      }
      requestAnimationFrame(subir)
      setSuena(true)
      return true
    } catch {
      setSuena(false)
      return false
    }
  }

  function pausar() {
    audioRef.current?.pause()
    setSuena(false)
  }

  useEffect(() => {
    try {
      quiereRef.current = localStorage.getItem(CLAVE) !== 'off'
    } catch {
      quiereRef.current = true
    }
    if (!quiereRef.current) return

    let activo = true
    const eventos = ['pointerup', 'touchend', 'keydown'] as const
    const quitar = () => eventos.forEach((ev) => window.removeEventListener(ev, alPrimerGesto, true))
    function alPrimerGesto(e: Event) {
      // El toque sobre el propio botón lo maneja su onClick.
      if (botonRef.current?.contains(e.target as Node)) { quitar(); return }
      quitar()
      if (activo && quiereRef.current) reproducir()
    }

    reproducir().then((ok) => {
      if (!ok && activo) eventos.forEach((ev) => window.addEventListener(ev, alPrimerGesto, true))
    })
    return () => { activo = false; quitar() }
  }, [])

  // Pausa al ocultar la pestaña; reanuda al volver si estaba sonando.
  useEffect(() => {
    let reanudar = false
    const alCambiar = () => {
      const a = audioRef.current
      if (!a) return
      if (document.hidden) { reanudar = !a.paused; a.pause() }
      else if (reanudar && quiereRef.current) { reanudar = false; reproducir() }
    }
    document.addEventListener('visibilitychange', alCambiar)
    return () => document.removeEventListener('visibilitychange', alCambiar)
  }, [])

  function alternar() {
    if (suena) {
      quiereRef.current = false
      pausar()
      try { localStorage.setItem(CLAVE, 'off') } catch {}
    } else {
      quiereRef.current = true
      try { localStorage.setItem(CLAVE, 'on') } catch {}
      reproducir()
    }
  }

  return (
    <>
      <audio ref={audioRef} loop preload="none" onPause={() => setSuena(false)} onPlay={() => setSuena(true)}>
        <source src="/recursos/audio/cancion.webm" type="audio/webm; codecs=opus" />
        <source src="/recursos/audio/cancion.m4a" type="audio/mp4" />
      </audio>
      <button
        ref={botonRef}
        type="button"
        onClick={alternar}
        aria-pressed={suena}
        aria-label={suena ? 'Silenciar la música' : 'Reproducir la música'}
        title={suena ? 'Silenciar' : 'Música'}
        className={`boton-musica ${suena ? 'suena' : ''}`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" fillOpacity=".18" />
          {suena ? (
            <>
              <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
              <path d="M18 6.8a7.4 7.4 0 0 1 0 10.4" />
            </>
          ) : (
            <path d="M16 9.5l5 5M21 9.5l-5 5" />
          )}
        </svg>
      </button>
    </>
  )
}
