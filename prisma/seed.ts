/**
 * Seed inicial de espacios para Casa del Sol
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de espacios...')

  // Datos iniciales de espacios
  const espacios = [
    // Locales
    { identificador: 'L-001', tipo: 'LOCAL', observaciones: 'PILATES' },
    { identificador: 'L-002', tipo: 'LOCAL', observaciones: 'PODOLOGIA' },
    { identificador: 'L-003', tipo: 'LOCAL', observaciones: 'FISIO' },
    { identificador: 'L-004', tipo: 'LOCAL', observaciones: 'SOPHIA' },
    { identificador: 'L-005', tipo: 'LOCAL', observaciones: 'TIMELESS' },
    { identificador: 'L-006', tipo: 'LOCAL', observaciones: 'LOCAL DE POKER' },
    { identificador: 'L-007', tipo: 'LOCAL', observaciones: 'CHE ALFAJOR' },
    { identificador: 'L-008', tipo: 'LOCAL', observaciones: 'MASJAES' },
    { identificador: 'L-009', tipo: 'LOCAL', observaciones: 'SALA GALARIA MUSICA' },
    { identificador: 'L-010', tipo: 'LOCAL', observaciones: 'ODONTOLOGIA' },

    // Consultorios
    { identificador: 'O-001', tipo: 'CONSULTORIO', observaciones: 'OFICINA 1' },
    { identificador: 'C-002', tipo: 'CONSULTORIO', observaciones: 'RENTA POR HORAS' },
    { identificador: 'C-003', tipo: 'CONSULTORIO', observaciones: 'RENTA POR HORAS' },
    { identificador: 'C-004', tipo: 'CONSULTORIO', observaciones: 'RENTA POR HORAS' },
    { identificador: 'C-005', tipo: 'CONSULTORIO', observaciones: 'CONSULTORIO 5' },
    { identificador: 'C-006', tipo: 'CONSULTORIO', observaciones: 'CONSULTORIO Y YOGA' },
    { identificador: 'C-007', tipo: 'CONSULTORIO', observaciones: 'CONSULTORIO CAN' },

    // Habitaciones
    { identificador: 'H-101', tipo: 'HABITACION', observaciones: '' },
    { identificador: 'H-105', tipo: 'HABITACION', observaciones: '' },
    { identificador: 'H-202', tipo: 'HABITACION', observaciones: '' },
    { identificador: 'H-204', tipo: 'HABITACION', observaciones: '' },
    { identificador: 'H-205', tipo: 'HABITACION', observaciones: '' },
    { identificador: 'H-209', tipo: 'HABITACION', observaciones: 'HOSPEDAJE AIRBNB', conceptoCobro: 'AIRBNB' },

    // Locales adicionales
    { identificador: 'L-117', tipo: 'LOCAL', observaciones: '' },
    { identificador: 'L-118', tipo: 'LOCAL', observaciones: '' },
  ]

  // Crear espacios
  for (const espacio of espacios) {
    await prisma.espacio.upsert({
      where: { identificador: espacio.identificador },
      update: {},
      create: espacio as any,
    })
  }

  console.log(`✅ ${espacios.length} espacios creados`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
