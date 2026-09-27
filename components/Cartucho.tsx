/**
 * Tarjeta con marco de oro y remate en arco: el saludo personal de la
 * invitación, montado sobre el borde inferior del héroe.
 *
 * El borde de oro es un div con la lámina y 3 px de padding; el contenido
 * va en un div claro encima. `border-image` no acepta radios distintos por
 * esquina.
 */
export default function Cartucho({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative z-[2] rounded-[120px_120px_22px_22px] p-[3px] shadow-[0_16px_38px_rgba(92,43,134,0.16)]"
      style={{ background: 'var(--oro-lamina)' }}
    >
      <div
        className="relative rounded-[117px_117px_19px_19px] px-[22px] pb-7 pt-9 text-center"
        style={{ background: 'radial-gradient(120% 60% at 50% 0%, #fffaf0, #fff 60%)' }}
      >
        <div className="pointer-events-none absolute inset-2 rounded-[110px_110px_13px_13px] border border-accent/35" />
        {children}
      </div>
    </div>
  )
}
