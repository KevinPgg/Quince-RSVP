import { NextResponse } from 'next/server'
import { esAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { FilaAsistencia } from '@/lib/types'

function celda(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET() {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const db = supabaseAdmin()
  const { data } = await db.from('vista_asistencia').select('*').order('nombre_display')
  const filas = (data ?? []) as FilaAsistencia[]

  const encabezado = [
    'nombre', 'estado', 'pases_asignados', 'pases_confirmados', 'grupo', 'mesa',
    'acompanantes', 'restricciones', 'telefono', 'mensaje', 'respondido_en', 'token',
  ]

  const cuerpo = filas.map((f) =>
    [
      f.nombre_display, f.estado, f.pases_asignados, f.pases_confirmados,
      f.grupo, f.mesa, f.acompanantes?.join(' | '), f.restricciones,
      f.telefono_rsvp ?? f.telefono_lista, f.mensaje, f.respondido_en, f.token,
    ].map(celda).join(',')
  )

  // BOM para que Excel abra los acentos bien
  const csv = '﻿' + [encabezado.join(','), ...cuerpo].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="asistencia.csv"',
    },
  })
}
