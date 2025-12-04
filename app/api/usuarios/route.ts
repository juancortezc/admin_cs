/**
 * API de Usuarios
 * GET /api/usuarios - Lista usuarios
 * POST /api/usuarios - Crea usuario
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Lista de usuarios
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
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
      orderBy: { nombre: 'asc' },
    })

    // Parse permisos JSON
    const usuariosConPermisos = usuarios.map(u => ({
      ...u,
      permisos: u.permisos ? JSON.parse(u.permisos) : null,
    }))

    return NextResponse.json(usuariosConPermisos)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST - Crear usuario
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos requeridos
    if (!body.nombre || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Nombre, email y password son requeridos' },
        { status: 400 }
      )
    }

    // Verificar email único
    const existente = await prisma.usuario.findUnique({
      where: { email: body.email.toLowerCase() },
    })

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre: body.nombre,
        email: body.email.toLowerCase(),
        password: body.password, // En producción usar hash
        rol: body.rol || 'USUARIO',
        activo: body.activo !== undefined ? body.activo : true,
        permisos: body.permisos ? JSON.stringify(body.permisos) : null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        permisos: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      ...usuario,
      permisos: usuario.permisos ? JSON.parse(usuario.permisos) : null,
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
