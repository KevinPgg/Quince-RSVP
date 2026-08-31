export function Campo({
  id, label, ayuda, children,
}: {
  id?: string
  label: string
  ayuda?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="etiqueta" htmlFor={id}>{label}</label>
      {children}
      {ayuda && <p className="mt-1.5 text-xs leading-snug text-muted">{ayuda}</p>}
    </div>
  )
}

export function Bloque({
  titulo, descripcion, children,
}: {
  titulo: string
  descripcion?: string
  children: React.ReactNode
}) {
  return (
    <section className="tarjeta">
      <h2 className="titulo-seccion text-xl">{titulo}</h2>
      {descripcion && <p className="mt-1 text-xs leading-relaxed text-muted">{descripcion}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function Interruptor({
  name, titulo, ayuda, defaultChecked, tono = 'normal',
}: {
  name: string
  titulo: string
  ayuda?: string
  defaultChecked?: boolean
  tono?: 'normal' | 'alerta'
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        tono === 'alerta' ? 'border-amber-300 bg-amber-50/60' : 'border-line'
      }`}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--c-primary))]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{titulo}</span>
        {ayuda && <span className="mt-0.5 block text-xs leading-snug text-muted">{ayuda}</span>}
      </span>
    </label>
  )
}
