/**
 * Seed de Arrendatarios - Casa del Sol
 * Crea 21 arrendatarios basados en el PDF de Espacios
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de arrendatarios...')

  const arrendatarios = [
    { nombre: 'LORENA PAEZ', email: '', celular: '' },
    { nombre: 'MILENA CHAMORRO', email: '', celular: '' },
    { nombre: 'CHRISTIAN ROJAS', email: '', celular: '' },
    { nombre: 'COTY SANTACRUZ', email: '', celular: '' },
    { nombre: 'DAVID CHAVEZ', email: '', celular: '' },
    { nombre: 'JAIME GRUBER', email: '', celular: '' },
    { nombre: 'FRANCISCO COBO', email: '', celular: '' },
    { nombre: 'MICHAEL FUNDILLER', email: '', celular: '' },
    { nombre: 'MILE.', email: '', celular: '' }, // ⚠️ Nombre incompleto
    { nombre: 'MARIO', email: '', celular: '' },
    { nombre: 'GABRIELA ROMERO', email: '', celular: '' },
    { nombre: 'LAURA CORRAL', email: '', celular: '' },
    { nombre: 'MARIA JOSE MURILLO', email: '', celular: '' },
    { nombre: 'CORINA ROMO', email: '', celular: '' }, // ⚠️ Sin espacio asignado
    { nombre: 'GUILLERMO LASSO', email: '', celular: '' },
    { nombre: 'PABLO VELA', email: '', celular: '' },
    { nombre: 'JORGE FERNANDEZ', email: '', celular: '' },
    { nombre: 'JAIME LEON', email: '', celular: '' },
    { nombre: 'BETINA', email: '', celular: '' }, // ⚠️ Nombre incompleto
    { nombre: 'IVAN MENDIETA', email: '', celular: '' },
    { nombre: 'JORGE GOMEZ', email: '', celular: '' },
  ]

  let creados = 0
  let actualizados = 0

  for (const arrendatario of arrendatarios) {
    try {
      // Usar email temporal único basado en nombre para evitar duplicados
      const emailTemp = arrendatario.email || `${arrendatario.nombre.toLowerCase().replace(/\s+/g, '.')}@temp.com`

      const result = await prisma.arrendatario.upsert({
        where: { email: emailTemp },
        update: {
          nombre: arrendatario.nombre,
          celular: arrendatario.celular,
        },
        create: {
          nombre: arrendatario.nombre,
          email: emailTemp,
          celular: arrendatario.celular,
        },
      })

      if (result.createdAt === result.updatedAt) {
        creados++
      } else {
        actualizados++
      }
    } catch (error) {
      console.error(`❌ Error al crear/actualizar arrendatario ${arrendatario.nombre}:`, error)
    }
  }

  console.log(`✅ ${creados} arrendatarios creados`)
  console.log(`✅ ${actualizados} arrendatarios actualizados`)
  console.log(`⚠️  Nombres incompletos detectados: MILE., MARIO, BETINA`)
  console.log(`⚠️  CORINA ROMO creada pero sin espacio asignado (duplicado C-005 resuelto)`)
  console.log(`⚠️  Todos los arrendatarios sin email/celular real - Ver REPORTE_INCONSISTENCIAS.md`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de arrendatarios:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
