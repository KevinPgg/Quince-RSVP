/** Línea de tiempo con rombos de oro. La comparten portada e invitación. */
export default function Itinerario({ items }: { items: { hora: string; titulo: string }[] }) {
  return (
    <div className="tarjeta-real">
      <ol className="relative m-0 list-none p-0 text-left">
        <span
          aria-hidden
          className="absolute bottom-2 top-2 w-px"
          style={{
            left: 78,
            background: 'linear-gradient(180deg, rgba(192,138,46,0), #c08a2e 12%, #c08a2e 88%, rgba(192,138,46,0))',
          }}
        />
        {items.map((it, i) => (
          <li key={i} className="relative grid grid-cols-[62px_32px_1fr] items-center py-3">
            <span className="text-right font-display text-xl font-medium leading-none text-primary">{it.hora}</span>
            <span aria-hidden className="gema justify-self-center" />
            <span className="text-[15px] leading-snug text-ink">{it.titulo}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
