# 📋 Guía de Usuario - Sistema de Administración

## 🏠 Visión General
Sistema completo de administración para gestionar espacios en arriendo, Airbnb, inventario, pagos, cobros y mantenimiento.

---

## 📅 1. CALENDARIO

### ¿Qué hace?
- Vista unificada de todos los eventos importantes
- Visualización mensual con código de colores

### Tipos de Eventos
- **Arriendos** (Azul): Pagos mensuales de arrendatarios
- **Servicios** (Morado): Vencimiento de servicios básicos (luz, agua, internet)
- **Empleados** (Verde): Fechas de pago de salarios
- **Pagos** (Naranja): Otros pagos y gastos
- **Check-in Airbnb** (Verde): Llegada de huéspedes
- **Check-out Airbnb** (Naranja): Salida de huéspedes

### Funciones
- ✅ Click en cualquier fecha para registrar eventos rápidamente
- ✅ Vista de eventos del día seleccionado
- ✅ Navegación por mes y año

---

## 💰 2. COBROS (Ingresos)

### ¿Qué hace?
- Gestión de todos los ingresos por arriendos
- Control de pagos parciales y totales
- Seguimiento de atrasos

### Funcionalidades
- ✅ Registro automático de cobros mensuales por espacio
- ✅ Cálculo automático de días de atraso
- ✅ Gestión de pagos parciales (abonos)
- ✅ Historial completo por espacio
- ✅ Exportación a Excel
- ✅ Estadísticas de cobros del mes

### Filtros Disponibles
- Por mes y año
- Por espacio
- Por estado (pendiente, parcial, pagado)
- Búsqueda por arrendatario

### Estados
- **Pendiente**: Sin pagar
- **Parcial**: Pago incompleto con abonos registrados
- **Pagado**: Cobro completo

---

## 💸 3. PAGOS (Egresos)

### ¿Qué hace?
- Control de todos los gastos y pagos salientes
- Gestión de pagos recurrentes y únicos

### Categorías
- **Servicios Básicos**: Luz, agua, internet, gas
- **Salarios**: Pagos a empleados
- **Otros Pagos**: Gastos únicos (mantenimiento, compras, etc.)

### Funcionalidades
- ✅ Configuración de pagos recurrentes automáticos
- ✅ Montos fijos o variables
- ✅ Múltiples formas de pago (efectivo, transferencia, cheque)
- ✅ Registro de facturas y comprobantes
- ✅ Estadísticas mensuales de gastos
- ✅ Alertas de próximos vencimientos

### Pagos Recurrentes
- Generación automática mensual
- Edición de monto antes de registrar
- Historial de pagos generados

---

## 🏢 4. ESPACIOS Y ARRENDATARIOS

### Espacios
**¿Qué hace?**
- Administración de todos los espacios disponibles

**Tipos de Espacios:**
- Locales (L-001, L-002...)
- Consultorios (C-001, C-002...)
- Habitaciones (H-001, H-002...)

**Información por Espacio:**
- ✅ Identificador único
- ✅ Arrendatario actual
- ✅ Monto de arriendo
- ✅ Día de pago
- ✅ Fechas de contrato
- ✅ Observaciones

### Arrendatarios
**¿Qué hace?**
- Registro de información de contacto
- Vinculación con espacios

**Información:**
- Nombre completo
- Email
- Celular
- Espacios asociados
- Historial de pagos

---

## 🏖️ 5. AIRBNB

### ¿Qué hace?
- Gestión completa de espacios de renta corta
- Control de reservas, huéspedes y pagos

### Secciones

#### 📍 Espacios Airbnb
- Registro de propiedades disponibles
- Capacidad, camas, baños
- Precio base por noche
- Amenidades

#### 👥 Huéspedes
- Registro de contactos
- Sistema de calificación (1-5 estrellas)
- Historial de estadías
- Notas importantes

#### 📅 Reservas
- **Información Básica:**
  - Código automático (AB-0001, AB-0002...)
  - Fechas check-in/check-out
  - Número de noches y huéspedes
  - Canal de reserva (Airbnb, Booking, Directo)

- **Control de Pagos:**
  - Precio total y por noche
  - Sistema de abonos
  - Balance pendiente
  - Estado de pago

- **Estados:**
  - Confirmada
  - En curso
  - Completada
  - Cancelada

- **Funcionalidades:**
  - ✅ Registro de notas durante la reserva
  - ✅ Notas finales al checkout
  - ✅ Calificación del huésped
  - ✅ Entrega de kits de bienvenida
  - ✅ Integración con calendario

#### 📦 Entrega de Kits
- Asignación de kits a reservas
- Control de devolución
- Registro de items faltantes/dañados
- Vinculación con inventario

---

## 📦 6. INVENTARIO

### ¿Qué hace?
- Control completo de stock
- Sistema Kardex por item
- Gestión de kits para Airbnb

### Categorías de Items
- Limpieza
- Amenidades (toallas, sábanas)
- Cocina
- Baño
- Electrodomésticos
- Muebles
- Mantenimiento
- Oficina

### Sistema Kardex
**¿Qué es?**
- Registro detallado de movimientos por item
- Control de entradas y salidas
- Actualización automática de stock

**Tipos de Movimientos:**
- **Entrada**: Compras, devoluciones
- **Salida**: Consumo, entregas, pérdidas
- **Ajustes**: Correcciones de inventario

**Información por Movimiento:**
- Cantidad y costo
- Saldo después del movimiento
- Persona que recibe (en salidas)
- Espacio vinculado
- Fecha y hora

### Alertas de Stock
- ⚠️ Notificación prominente cuando stock ≤ mínimo
- Lista de items que requieren reposición
- Diferencia entre stock actual y mínimo

### Kits para Airbnb
**¿Qué son?**
- Conjuntos predefinidos de items
- Ejemplo: "Kit Bienvenida" (jabón, shampoo, toallas)

**Funciones:**
- ✅ Creación de kits personalizados
- ✅ Asignación de cantidades por item
- ✅ Entrega automática a reservas
- ✅ Control de devolución
- ✅ Movimientos automáticos en inventario
- ✅ Cálculo de costo total

---

## 🔧 7. MANTENIMIENTO

### ¿Qué hace?
- Sistema de tickets para solicitudes de mantenimiento
- Seguimiento de trabajos y reparaciones
- Control de costos y estados

### Creación de Tickets

**Información Básica:**
- Título descriptivo
- Descripción detallada del problema
- Código automático (TKT-0001, TKT-0002...)

**Prioridades:**
- 🔴 **Urgente**: Requiere atención inmediata
- 🟠 **Alta**: Importante, resolver pronto
- 🟡 **Media**: Normal
- 🟢 **Baja**: Puede esperar

**Categorías:**
- Electricidad
- Plomería
- Pintura
- Carpintería
- Cerrajería
- Limpieza
- Electrodomésticos
- Climatización (AC, calefacción)
- Tecnología (internet, cámaras)
- Mobiliario
- General
- Otros

**Estados:**
- **Pendiente**: Recién creado, sin iniciar
- **En Proceso**: Trabajo en curso
- **En Espera**: Esperando piezas, aprobación, etc.
- **Completado**: Trabajo finalizado
- **Cancelado**: No se realizará

### Control de Fechas
- Fecha de creación (automática)
- Fecha de inicio del trabajo
- Fecha estimada de finalización
- Fecha real de completado (automática al marcar como completado)

### Gestión de Costos
- **Costo Estimado**: Presupuesto inicial
- **Costo Real**: Costo final actualizado
- Actualización automática al agregar novedades con costo

### Vinculaciones
- **Espacio**: ¿Dónde se realiza el trabajo?
- **Proveedor**: ¿Quién realiza el servicio?
- **Asignado a**: Técnico o persona responsable

### Sistema de Novedades

**¿Qué son?**
- Actualizaciones y registro de progreso del ticket
- Historial completo de lo que sucede

**Tipos de Novedades:**
- **Actualización**: Progreso general
- **Cambio de Estado**: Cuando cambia el estado del ticket
- **Costo Adicional**: Gastos extras encontrados
- **Problema**: Nuevo problema descubierto
- **Solución**: Solución aplicada
- **Nota**: Anotación general

**Información por Novedad:**
- Descripción detallada
- Tipo de novedad
- Costo asociado (si aplica)
- Quién registra la novedad
- Fecha y hora automática

**Actualización Automática:**
- Al agregar una novedad con costo, el costo real del ticket se actualiza automáticamente
- Historial cronológico completo

### Estadísticas y Filtros

**Panel de Control:**
- Total de tickets
- Pendientes
- En proceso
- Completados
- Tickets urgentes activos
- Costo total de todos los tickets

**Filtros Disponibles:**
- Por estado
- Por prioridad
- Por categoría
- Búsqueda por número, título o descripción

**Alertas:**
- ⚠️ Notificación destacada cuando hay tickets urgentes
- Cantidad de tickets que requieren atención inmediata

### Flujo de Trabajo Recomendado

1. **Crear Ticket**
   - Registrar problema con título y descripción clara
   - Asignar prioridad según urgencia
   - Seleccionar categoría apropiada
   - Vincular espacio si aplica

2. **Asignar Responsable**
   - Seleccionar proveedor si es externo
   - Asignar a técnico o persona interna
   - Establecer fecha estimada de finalización

3. **Registrar Progreso**
   - Agregar novedades conforme avanza el trabajo
   - Registrar problemas encontrados
   - Documentar soluciones aplicadas
   - Actualizar costos adicionales

4. **Completar Ticket**
   - Cambiar estado a "Completado"
   - Agregar novedad final con resumen
   - Verificar costo final vs estimado
   - Fecha de completado se registra automáticamente

---

## 💼 8. CAJA (Resumen Financiero)

### ¿Qué hace?
- Vista consolidada de todas las finanzas
- Comparación de ingresos vs egresos
- Indicadores de salud financiera

### Métricas Disponibles
- Total de ingresos del mes
- Total de egresos del mes
- Balance neto
- Gráficos de tendencias
- Desglose por categoría

---

## 📊 Estadísticas Generales

Cada módulo incluye:
- ✅ Panel de métricas en tiempo real
- ✅ Filtros avanzados
- ✅ Búsqueda rápida
- ✅ Exportación de datos
- ✅ Códigos únicos auto-generados

---

## 🎨 Diseño del Sistema

### Colores de Estado
- 🟢 **Verde**: Completado, pagado, confirmado
- 🔵 **Azul**: En proceso, activo
- 🟡 **Amarillo**: Pendiente, advertencia, en espera
- 🟠 **Naranja**: Alta prioridad, parcialmente pagado
- 🔴 **Rojo**: Urgente, atrasado, cancelado
- ⚫ **Gris**: Inactivo, sin asignar

### Navegación
- Barra superior con acceso rápido a todos los módulos
- Diseño responsivo (funciona en celular, tablet y computadora)
- Modales para acciones rápidas sin cambiar de página

---

## 💡 Consejos de Uso

### Para Cobros
1. Deja que el sistema genere los cobros mensuales automáticamente
2. Registra pagos parciales apenas los recibas
3. Revisa el calendario para ver fechas de pago
4. Exporta a Excel al final del mes para reportes

### Para Pagos
1. Configura los pagos recurrentes una sola vez
2. El sistema te recordará los próximos vencimientos
3. Edita el monto si es variable antes de confirmar
4. Guarda referencias de transferencias y facturas

### Para Airbnb
1. Registra huéspedes en su primera visita
2. Crea la reserva con todas las fechas
3. Registra abonos conforme los recibas
4. Califica al huésped al finalizar la estadía
5. Asigna kits al check-in y controla la devolución

### Para Inventario
1. Establece stocks mínimos realistas
2. Registra movimientos apenas ocurran
3. Revisa las alertas de stock bajo regularmente
4. Usa kits predefinidos para agilizar entregas

### Para Mantenimiento
1. Crea tickets apenas detectes un problema
2. Asigna prioridad correctamente (urgente solo si es realmente urgente)
3. Mantén el ticket actualizado con novedades
4. Registra costos adicionales inmediatamente
5. Completa el ticket con una novedad final resumiendo el trabajo

---

## 🔐 Seguridad

- Todos los datos se guardan automáticamente
- Base de datos segura en la nube (Neon)
- Respaldos automáticos
- Acceso mediante URL de producción

---

## 📱 Acceso

**URL de Producción:**
https://admin-cs.vercel.app

**Recomendación:**
Guarda la URL en tus favoritos para acceso rápido

---

## ❓ Preguntas Frecuentes

**¿Se pierden los datos si cierro el navegador?**
No, todo se guarda automáticamente en la nube.

**¿Puedo usar el sistema desde mi celular?**
Sí, el diseño es responsivo y funciona en cualquier dispositivo.

**¿Los códigos se generan solos?**
Sí, todos los códigos (P-0001, TKT-0001, AB-0001, etc.) son automáticos.

**¿Puedo editar o eliminar registros?**
Sí, cada registro tiene opciones de editar y eliminar.

**¿Las estadísticas se actualizan solas?**
Sí, todas las métricas se calculan en tiempo real.

**¿Qué pasa si registro un pago parcial por error?**
Puedes eliminar el abono y volver a registrarlo correctamente.

**¿Puedo tener múltiples espacios Airbnb?**
Sí, puedes registrar tantos espacios como necesites.

**¿El sistema calcula automáticamente los días de atraso?**
Sí, compara la fecha de cobro con la fecha esperada.

**¿Los tickets de mantenimiento tienen historial?**
Sí, cada ticket guarda todas las novedades con fecha y hora.

**¿Puedo vincular un ticket a un espacio específico?**
Sí, al crear el ticket puedes seleccionar el espacio relacionado.

---

## 📞 Soporte

Para cualquier duda o problema:
- Revisa esta guía primero
- Verifica que estés usando la URL correcta
- Recarga la página si algo no se actualiza

---

**Última actualización:** Octubre 2025
**Versión del sistema:** 2.0
