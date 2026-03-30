# Proyecto: INVITATORIO - Sistema de Invitaciones Dinámicas Fullstack

## Objetivo del Sistema
Construir una plataforma SaaS en Next.js (App Router) que permita generar invitaciones interactivas (Bodas, XV, Kids). El diseño debe ser vibrante y profesional, evitando temas oscuros, basado en la paleta de colores del logo "Invitatorio".

## 🎨 Identidad Visual (Basada en Logo)
- **Principal:** Naranja (#F29100) - Botones, acentos y llamadas a la acción.
- **Secundario:** Morado (#6A3093) - Títulos, íconos y branding.
- **Fondo:** Blanco puro (#FFFFFF) y Gris muy claro (#F8F9FA).
- **Tipografía:** Sans-serif moderna para el cuerpo y Serif elegante para nombres en invitaciones.

## 🛠️ Stack Tecnológico
- **Framework:** Next.js 14+ (App Router).
- **Base de Datos:** MySQL.
- **ORM & Migraciones:** Prisma ORM.
- **Estilos:** Tailwind CSS.
- **Componentes:** Shadcn/UI (para tablas y formularios de administración).

## 🗄️ Estructura de Base de Datos (Prisma Schema)
Generar los siguientes modelos:
1. **User:** id, email, password, role (ADMIN, CLIENT).
2. **Template:** id, name (Boda, XV, Kids), slug, thumbnail, base_config (JSON).
3. **Invitation:** - id, user_id, template_id, slug (URL única).
   - status (DRAFT, PUBLISHED).
   - content (JSON): Almacenará: Título, Pareja, Fecha, Cita, Historia, Lat/Lng Mapa, Mesa de Regalos.
4. **Media:** id, invitation_id, url, order (máximo 4 para la galería).

## 📂 Arquitectura de Carpetas Sugerida
/app
  /(auth)           # Login y registro
  /(admin)          # Panel de administración
    /users          # CRUD Usuarios
    /editor         # Editor Side-by-Side (Formulario | Preview)
  /[slug]           # Ruta dinámica para la invitación pública
/components
  /templates        # Componentes de cada plantilla (WeddingTemplate, XVTemplate)
  /ui               # Componentes base (Botones, Inputs)
/lib
  /prisma.ts        # Cliente de conexión a MySQL
/prisma
  /schema.prisma    # Definición de tablas y migraciones

## 🚀 Requerimientos Funcionales
1. **Migraciones:** Configurar el flujo para que al modificar `schema.prisma`, se ejecute `npx prisma migrate dev`.
2. **Panel de Editor:** - Lado izquierdo: Formulario dinámico basado en el tipo de plantilla.
   - Lado derecho: Previsualización en tiempo real (Live Preview) con diseño responsivo.
3. **Galería:** Lógica de subida de imágenes restringida a 4 archivos.
4. **Navbar:** Implementar la barra de navegación superior según la imagen de referencia (INICIO, BODAS, XVS, RECUERDATORIO, KIDS, A LA CARTA).

## 🛠️ Instrucción Inicial para el Agente
"Genera el archivo schema.prisma inicial y la configuración de conexión a MySQL mediante .env. Luego, crea la estructura de carpetas de Next.js y el layout base con los colores naranja y morado definidos."