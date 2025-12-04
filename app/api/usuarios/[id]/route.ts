/**
 * API de Usuario Individual
 * GET /api/usuarios/[id] - Obtener usuario
 * PUT /api/usuarios/[id] - Actualizar usuario
 * DELETE /api/usuarios/[id] - Eliminar usuario
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// GET - Obtener usuario
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        permisos: true,
        ultimoAcceso: true,
        createdAt: true,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...usuario,
      permisos: usuario.permisos ? JSON.parse(usuario.permisos) : null,
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar usuario
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que existe
    const existente = await prisma.usuario.findUnique({ where: { id } })
    if (!existente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si cambia email, verificar que no exista
    if (body.email && body.email.toLowerCase() !== existente.email) {
      const emailExiste = await prisma.usuario.findUnique({
        where: { email: body.email.toLowerCase() },
      })
      if (emailExiste) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con ese email' },
          { status: 400 }
        )
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nombre: body.nombre || undefined,
        email: body.email ? body.email.toLowerCase() : undefined,
        password: body.password || undefined,
        rol: body.rol || undefined,
        activo: body.activo !== undefined ? body.activo : undefined,
        permisos: body.permisos !== undefined
          ? (body.permisos ? JSON.stringify(body.permisos) : null)
          : undefined,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        permisos: true,
        ultimoAcceso: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      ...usuario,
      permisos: usuario.permisos ? JSON.parse(usuario.permisos) : null,
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    await prisma.usuario.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
