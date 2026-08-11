# Gestor — Fase 1

Proyectos, agenda, cumpleaños y pagos en una sola app. Next.js 15 + Prisma + MySQL + NextAuth, pensada para Vercel (app) + Hostinger (base de datos), igual que tus otros proyectos.

## 1. Instalación local

```bash
npm install
cp .env.example .env
```

Edita `.env` con tu cadena de conexión MySQL (Hostinger) y un `NEXTAUTH_SECRET` aleatorio:

```bash
openssl rand -base64 32
```

## 2. Base de datos

```bash
npx prisma generate
npx prisma db push      # crea las tablas en tu MySQL de Hostinger
npm run db:seed         # crea un usuario de prueba: marcos@example.com / cambia-esta-clave
```

## 3. Correr en local

```bash
npm run dev
```

Abre `http://localhost:3000`, inicia sesión con el usuario del seed y cambia la clave (por ahora el cambio de clave se hace directo en la base de datos o agregando una pantalla de perfil — no está en el alcance de Fase 1).

## 4. Desplegar

- **Vercel**: conecta el repo de GitHub, agrega las variables `DATABASE_URL` y `NEXTAUTH_SECRET` (y `NEXTAUTH_URL` con tu dominio final) en el panel de Vercel.
- **Hostinger**: usa la misma base MySQL que ya tienes configurada para tus otros proyectos; solo crea una base nueva para esta app.

## Qué incluye esta Fase 1

- **Hoy**: pantalla principal para celular — actividades del día, atrasadas, citas, pagos por vencer y cumpleaños, todo con el tap de 3 estados (Pendiente → En proceso → Completado)
- **Proyectos**: crear proyecto, agregar actividades (con periodicidad única/quincenal/mensual, que genera automáticamente sus ocurrencias), ver avance real vs. planificado y días restantes
- **Calendario**: vista mensual con filtro por tipo (Proyectos/Citas/Cumpleaños/Pagos)
- **Citas, Cumpleaños, Pagos**: CRUD simple con formularios rápidos

## Lo que queda para Fase 2

- Bloqueo real de actividades por dependencia (el campo `predecesoraId` ya existe en el esquema)
- Reporte Gantt visual
- Reporte general de proyectos (tabla ordenable con desviación planificado/real)
- Notificaciones push/email

## Estructura

```
app/            rutas (App Router): hoy, proyectos, calendario, citas, cumpleanos, pagos, api/*
components/     EstadoToggle (el tap de 3 estados), formularios, calendario, nav
lib/            prisma, auth, generación de ocurrencias, cálculo de avance
prisma/         schema.prisma, seed.ts
```
