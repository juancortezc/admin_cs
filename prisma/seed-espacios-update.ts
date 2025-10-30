/**
 * Seed de Actualización de Espacios - Casa del Sol
 * Actualiza 25 espacios con datos del PDF de Espacios
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando actualización de espacios...')

  // Primero, obtener todos los arrendatarios para mapeo
  const arrendatarios = await prisma.arrendatario.findMany()
  const arrendatarioMap = new Map(
    arrendatarios.map((a) => [a.nombre, a.id])
  )

  // Datos de espacios del PDF
  const espaciosData = [
    {
      identificador: 'L-001',
      arrendatario: 'LORENA PAEZ',
      monto: 850.00,
      diaPago: 15,
      observaciones: 'PILATES',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-002',
      arrendatario: 'MILENA CHAMORRO',
      monto: 300.00,
      diaPago: 5,
      observaciones: 'PODOLOGIA',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-003',
      arrendatario: 'CHRISTIAN ROJAS',
      monto: 800.00,
      diaPago: 5,
      observaciones: 'FISIO',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-004',
      arrendatario: 'COTY SANTACRUZ',
      monto: 500.00,
      diaPago: 15,
      observaciones: 'SOPHIA',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-005',
      arrendatario: 'DAVID CHAVEZ',
      monto: 450.00,
      diaPago: 5,
      observaciones: 'TIMELESS',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-006',
      arrendatario: 'JAIME GRUBER',
      monto: 800.00,
      diaPago: 5,
      observaciones: 'LOCAL DE POKER',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-117',
      arrendatario: 'FRANCISCO COBO',
      monto: 650.00,
      diaPago: 5,
      observaciones: 'CHE ALFAJOR',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'O-001',
      arrendatario: 'MICHAEL FUNDILLER',
      monto: 200.00,
      diaPago: 5,
      observaciones: 'OFICINA 1',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'C-002',
      arrendatario: 'MILE.',
      monto: 64.00,
      diaPago: 30,
      observaciones: 'RENTA POR HORAS',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'C-003',
      arrendatario: null, // ⚠️ Sin arrendatario
      monto: 115.00,
      diaPago: null, // ⚠️ Sin día
      observaciones: 'RENTA POR HORAS',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'C-004',
      arrendatario: 'MARIO',
      monto: 12.00,
      diaPago: null, // ⚠️ Sin día
      observaciones: 'RENTA POR HORAS',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'C-005',
      arrendatario: 'GABRIELA ROMERO',
      monto: 250.00,
      diaPago: 30,
      observaciones: 'CONSULTORIO 5',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'C-006',
      arrendatario: null, // ⚠️ Sin arrendatario
      monto: 243.00,
      diaPago: null, // ⚠️ Sin día
      observaciones: 'CONSULTORIO Y YOGA',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-008',
      arrendatario: 'LAURA CORRAL',
      monto: null, // ⚠️ Sin monto
      diaPago: null, // ⚠️ Sin día
      observaciones: 'MASJAES',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-009',
      arrendatario: null, // ⚠️ Sin arrendatario
      monto: null, // ⚠️ Sin monto
      diaPago: null, // ⚠️ Sin día
      observaciones: 'SALA GALARIA MUSICA',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'L-010',
      arrendatario: 'MARIA JOSE MURILLO',
      monto: 250.00,
      diaPago: 15,
      observaciones: 'ODONTOLOGIA',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'C-007',
      arrendatario: 'IVAN MENDIETA',
      monto: 300.00,
      diaPago: 5,
      observaciones: '',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'H-105',
      arrendatario: 'GUILLERMO LASSO',
      monto: 250.00,
      diaPago: 5,
      observaciones: '',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'H-101',
      arrendatario: 'PABLO VELA',
      monto: 250.00,
      diaPago: 30,
      observaciones: '',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'H-202',
      arrendatario: 'JORGE FERNANDEZ',
      monto: 400.00,
      diaPago: null, // ⚠️ Sin día
      observaciones: '',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'H-204',
      arrendatario: 'JAIME LEON',
      monto: 500.00,
      diaPago: null, // ⚠️ Sin día
      observaciones: '',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'H-205',
      arrendatario: 'BETINA',
      monto: 500.00,
      diaPago: 6,
      observaciones: '',
      conceptoCobro: 'RENTA' as const,
    },
    {
      identificador: 'H-209',
      arrendatario: null, // ⚠️ Airbnb - sin arrendatario fijo
      monto: null, // ⚠️ Sin monto fijo
      diaPago: null, // ⚠️ Sin día fijo
      observaciones: 'HOSPEDAJE AIRBNB',
      conceptoCobro: 'AIRBNB' as const,
    },
    {
      identificador: 'L-118',
      arrendatario: 'JORGE GOMEZ',
      monto: 200.00,
      diaPago: null, // ⚠️ Sin día
      observaciones: 'Poker',
      conceptoCobro: 'RENTA' as const,
    },
  ]

  let actualizados = 0
  let errores = 0
  const advertencias: string[] = []

  for (const espacioData of espaciosData) {
    try {
      // Obtener ID del arrendatario si existe
      const arrendatarioId = espacioData.arrendatario
        ? arrendatarioMap.get(espacioData.arrendatario)
        : null

      if (espacioData.arrendatario && !arrendatarioId) {
        advertencias.push(
          `⚠️  ${espacioData.identificador}: Arrendatario "${espacioData.arrendatario}" no encontrado en DB`
        )
      }

      // Actualizar espacio
      await prisma.espacio.update({
        where: { identificador: espacioData.identificador },
        data: {
          arrendatarioId: arrendatarioId || null,
          monto: espacioData.monto,
          montoPactado: espacioData.monto, // Mismo valor inicial
          diaPago: espacioData.diaPago,
          conceptoCobro: espacioData.conceptoCobro,
          observaciones: espacioData.observaciones || null,
        },
      })

      actualizados++

      // Registrar advertencias por datos faltantes
      if (!arrendatarioId && espacioData.identificador !== 'H-209') {
        advertencias.push(`⚠️  ${espacioData.identificador}: Sin arrendatario asignado`)
      }
      if (!espacioData.monto && espacioData.identificador !== 'H-209') {
        advertencias.push(`⚠️  ${espacioData.identificador}: Sin monto definido`)
      }
      if (!espacioData.diaPago) {
        advertencias.push(`⚠️  ${espacioData.identificador}: Sin día de pago definido`)
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${espacioData.identificador}:`, error)
      errores++
    }
  }

  console.log(`\n✅ ${actualizados} espacios actualizados`)
  if (errores > 0) {
    console.log(`❌ ${errores} espacios con errores`)
  }

  if (advertencias.length > 0) {
    console.log(`\n⚠️  Advertencias (${advertencias.length}):`)
    advertencias.forEach((adv) => console.log(adv))
    console.log(`\n📄 Ver REPORTE_INCONSISTENCIAS.md para detalles completos`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de espacios:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
