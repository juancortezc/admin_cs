# Casa del Sol - Sistema de Administración

Sistema de administración para edificio con Next.js, TypeScript, Prisma y Neon.

## Stack Tecnológico

- **Framework**: Next.js 15 + TypeScript
- **Base de datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Estilos**: Tailwind CSS
- **Hosting**: Vercel

## Configuración Inicial

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar base de datos Neon**
   - Ir a [Neon Console](https://console.neon.tech)
   - Copiar `DATABASE_URL` y `DIRECT_URL`
   - Pegar en `.env`

3. **Ejecutar migraciones**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Iniciar desarrollo**
```bash
npm run dev
```

## Estructura Base de Datos

### Espacios
- Identificador único (L-001, C-001, H-001)
- Tipo: Local, Consultorio, Habitación
- Información de arriendo y arrendatario

### Arrendatarios
- Datos de contacto
- Relación con espacios arrendados

## Comandos Prisma

```bash
# Ver BD en navegador
npx prisma studio

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Generar cliente
npx prisma generate
```
