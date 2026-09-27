/**
 * Tarjeta con marco de oro y remate en arco. Es el gesto central de la
 * invitación: el saludo personal va aquí, montado sobre el héroe.
 *
 * El borde de oro es un div con degradado y 3 px de padding; el contenido
 * va en un div blanco encima. No se usa `border-image` porque no acepta
 * radios distintos por esquina.
 */
export default function Cartucho({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[100px_100px_20px_20px] p-[3px] shadow-[0_16px_38px_rgba(92,43,134,0.16)]
                 [background:linear-gradient(150deg,#f4e0ae,#c08a2e_32%,#f7ecc9_54%,#b07d24_76%,#eed9a4)]"
    >
      <div className="relative rounded-[97px_97px_17px_17px] bg-white px-[22px] pb-[26px] pt-8 text-center">
        <div className="pointer-events-none absolute inset-2 rounded-[90px_90px_11px_11px] border border-accent/35" />
        {children}
      </div>
    </div>
  )
}
