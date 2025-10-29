/**
 * Actualizar espacios con arrendatarios y datos de arriendo
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Actualizando espacios con arrendatarios...')

  // Datos de arrendatarios y espacios
  const updates = [
    { id: 'L-001', arrendatario: 'LORENA PAEZ', monto: 850, diaPago: 15 },
    { id: 'L-002', arrendatario: 'MILENA CHAMORRO', monto: 359, diaPago: 5 },
    { id: 'L-003', arrendatario: 'CHRISTIAN ROJAS', monto: 800, diaPago: 5 },
    { id: 'L-004', arrendatario: 'COTY SANTACRUZ', monto: 500, diaPago: 15 },
    { id: 'L-005', arrendatario: 'DAVID CHAVEZ', monto: 450, diaPago: 5 },
    { id: 'L-006', arrendatario: 'JAIME GRUBER', monto: 800, diaPago: 5 },
    { id: 'L-007', arrendatario: 'CARLA', monto: 650, diaPago: 5 },
    { id: 'O-001', arrendatario: 'MICHAEL FUNDILLER', monto: 200, diaPago: 5 },
    { id: 'C-002', arrendatario: 'MILE.', monto: 64, diaPago: 30 },
    { id: 'C-003', arrendatario: null, monto: 115, diaPago: null },
    { id: 'C-004', arrendatario: 'MARIO', monto: 150, diaPago: null },
    { id: 'C-005', arrendatario: 'GABRIELA ROMERO', monto: 250, diaPago: 30 },
    { id: 'C-006', arrendatario: 'RENTA POR HORAS', monto: 243, diaPago: null },
    { id: 'L-008', arrendatario: null, monto: 70, diaPago: null },
    { id: 'L-009', arrendatario: null, monto: null, diaPago: null },
    { id: 'L-010', arrendatario: 'MARIA JOSE MURILLO', monto: 250, diaPago: 15 },
    { id: 'C-007', arrendatario: 'CORINA ROMO', monto: 250, diaPago: 15 },
    { id: 'H-105', arrendatario: 'GUILLERMO LASSO', monto: 250, diaPago: 5 },
    { id: 'H-101', arrendatario: 'PABLO VELA', monto: 250, diaPago: 30 },
    { id: 'H-202', arrendatario: 'JORGE FERNANDEZ', monto: 400, diaPago: null },
    { id: 'H-204', arrendatario: 'JAIME LEON', monto: 500, diaPago: null },
    { id: 'H-205', arrendatario: 'BETINA', monto: 500, diaPago: 6 },
  ]

  let count = 0

  for (const update of updates) {
    let arrendatarioId = null

    // Crear o encontrar arrendatario si existe
    if (update.arrendatario) {
      const arrendatario = await prisma.arrendatario.upsert({
        where: { email: `${update.arrendatario.toLowerCase().replace(/\s+/g, '')}@temp.com` },
        update: {},
        create: {
          nombre: update.arrendatario,
          email: `${update.arrendatario.toLowerCase().replace(/\s+/g, '')}@temp.com`,
          celular: 'Por actualizar',
        },
      })
      arrendatarioId = arrendatario.id
    }

    // Actualizar espacio
    await prisma.espacio.update({
      where: { identificador: update.id },
      data: {
        arrendatarioId,
        monto: update.monto,
        diaPago: update.diaPago,
      },
    })

    count++
  }

  console.log(`✅ ${count} espacios actualizados con arrendatarios`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
