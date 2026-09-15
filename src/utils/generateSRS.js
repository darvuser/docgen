import { ALL_MODULES, COUNTRIES, SIZES, INDUSTRIES } from '../data/industries.js'

export function generateSRS({ prompt, country, size, industry, subIndustry, selectedModules, answers }) {
  const countryData = COUNTRIES.find(c => c.value === country) || COUNTRIES[0]
  const sizeData = SIZES.find(s => s.value === size) || SIZES[1]
  const industryData = INDUSTRIES.find(i => i.isic === industry)
  const subIndustryData = industryData?.subIndustries.find(s => s.value === subIndustry)

  const moduleList = selectedModules
    .map(id => ALL_MODULES[id])
    .filter(Boolean)

  const groupedModules = moduleList.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = []
    acc[mod.category].push(mod)
    return acc
  }, {})

  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

  const answersBlock = answers && Object.keys(answers).length > 0
    ? Object.entries(answers).map(([q, a]) => `- **${q}:** ${a}`).join('\n')
    : '- Sin respuestas adicionales registradas'

  const modulesBlock = Object.entries(groupedModules)
    .map(([category, mods]) => {
      const modRows = mods.map(m =>
        `| ${m.label} | ${m.desc} | Alta |`
      ).join('\n')
      return `### ${category}\n\n| Módulo | Descripción | Prioridad |\n|--------|-------------|-----------|  \n${modRows}`
    }).join('\n\n')

  const userStoriesBlock = moduleList.slice(0, 8).map(mod => {
    return `#### ${mod.label}\n- **Como** usuario del sistema, **quiero** ${mod.desc.toLowerCase()} **para** mejorar la gestión de mi negocio.\n- **Criterio de aceptación:** El sistema debe permitir registrar, consultar, editar y eliminar información de ${mod.label.toLowerCase()}, con validaciones de datos y mensajes de confirmación.`
  }).join('\n\n')

  const techStack = getTechStack(size, selectedModules)
  const standards = industryData?.standards?.join(', ') || 'ISO 9001'

  return `# Documento de Especificación de Requerimientos de Software (SRS)
## ${subIndustryData?.label || industryData?.label || 'Sistema de Gestión'} — Sistema de Gestión Empresarial

---

**Versión:** 1.0  
**Fecha:** ${today}  
**País de operación:** ${countryData.label}  
**Tamaño de empresa:** ${sizeData.label}  
**Sector ISIC:** ${industryData?.isic} — ${industryData?.label}  
**Sub-sector:** ${subIndustryData?.label || 'General'}  
**Estándares aplicables:** ${standards}  
**Ente fiscal:** ${countryData.tax}  
**Estado:** Borrador para revisión

---

## 1. Introducción

### 1.1 Propósito

Este documento define los requerimientos funcionales y no funcionales del sistema de gestión empresarial solicitado. Está diseñado para servir como base de desarrollo tanto para equipos humanos como para agentes de desarrollo asistido por IA (Claude Code, Cursor, Windsurf, etc.).

### 1.2 Descripción del negocio (en palabras del cliente)

> ${prompt || 'El cliente no proporcionó descripción adicional.'}

### 1.3 Alcance del sistema

El sistema cubrirá ${moduleList.length} módulos funcionales para una empresa del sector **${industryData?.label}** (${subIndustryData?.label || 'General'}) operando en **${countryData.label}**, con **${sizeData.label}**.

### 1.4 Contexto regulatorio

- **Facturación electrónica:** Integración con ${countryData.tax} (${countryData.currency})
- **Estándares de industria:** ${standards}
- **Moneda base:** ${countryData.currency}

---

## 2. Descripción general del sistema

### 2.1 Perspectiva del producto

Sistema web SaaS multi-usuario, accesible desde navegador y dispositivos móviles. No requiere instalación local. Los datos se almacenan en la nube con respaldo automático.

### 2.2 Funciones principales del sistema

${moduleList.map((m, i) => `${i + 1}. **${m.label}:** ${m.desc}`).join('\n')}

### 2.3 Características de los usuarios

| Tipo de usuario | Descripción | Nivel técnico |
|----------------|-------------|---------------|
| Administrador | Configuración del sistema, usuarios y permisos | Medio |
| Operador | Uso diario del sistema en sus módulos asignados | Básico |
| Gerente / Dueño | Consulta de reportes y aprobaciones | Básico |

### 2.4 Restricciones generales

- El sistema debe operar en navegadores modernos (Chrome, Firefox, Edge, Safari)
- Tiempo de respuesta máximo: 3 segundos por operación estándar
- Disponibilidad mínima: 99.5% (mensual)
- Los datos deben cumplir con la normativa de protección de datos vigente en ${countryData.label}

---

## 3. Requerimientos funcionales por módulo

${modulesBlock}

---

## 4. Historias de usuario (User Stories)

${userStoriesBlock}

---

## 5. Requerimientos no funcionales

### 5.1 Rendimiento
- Carga inicial del sistema: < 3 segundos
- Generación de reportes: < 10 segundos para rangos de hasta 12 meses
- Soporte simultáneo de hasta ${size === 'micro' ? '3' : size === 'small' ? '10' : size === 'medium' ? '30' : '100'} usuarios activos

### 5.2 Seguridad
- Autenticación con usuario y contraseña + 2FA opcional
- Roles y permisos por módulo y acción (CRUD)
- Registro de auditoría (log) de todas las operaciones críticas
- Encriptación de datos sensibles en tránsito (TLS 1.3) y en reposo (AES-256)

### 5.3 Usabilidad
- Interfaz en español (${countryData.label})
- Diseño responsivo (mobile-first)
- Flujos principales completables en máximo 4 pasos
- Mensajes de error descriptivos y orientados a la acción

### 5.4 Disponibilidad y respaldo
- Respaldo automático diario de base de datos
- Recuperación ante fallos en < 4 horas (RTO)
- Punto de recuperación máximo: 24 horas (RPO)

---

## 6. Arquitectura técnica sugerida

${techStack}

---

## 7. Integraciones requeridas

### 7.1 Integraciones obligatorias
- **${countryData.tax}:** Emisión y validación de documentos electrónicos (${countryData.currency})
- **Correo electrónico:** Envío de facturas, reportes y notificaciones
- **Almacenamiento de archivos:** PDFs, imágenes y documentos adjuntos

### 7.2 Integraciones opcionales (fase 2)
- Pasarela de pagos en línea
- WhatsApp Business API (notificaciones y estados de cuenta)
- Exportación a contabilidad (XML, CSV)

---

## 8. Decisiones técnicas registradas (ADR)

### ADR-001: Arquitectura web SaaS
- **Decisión:** Sistema 100% web, sin cliente desktop
- **Razón:** Acceso desde cualquier dispositivo, sin costos de instalación para el cliente
- **Consecuencias:** Requiere conexión a internet; funcionalidad offline limitada

### ADR-002: Base de datos relacional
- **Decisión:** Base de datos relacional (PostgreSQL recomendado)
- **Razón:** Datos estructurados con relaciones complejas entre módulos; integridad transaccional crítica
- **Consecuencias:** Requiere diseño cuidadoso del esquema; migraciones controladas

### ADR-003: API REST
- **Decisión:** Backend como API REST separado del frontend
- **Razón:** Permite integrar módulos adicionales y apps móviles en el futuro sin reescribir el core
- **Consecuencias:** Mayor complejidad inicial; mejor escalabilidad a largo plazo

---

## 9. Detalles adicionales recopilados

${answersBlock}

---

## 10. Criterios de aceptación globales

- [ ] Todos los módulos seleccionados implementados y probables por el cliente
- [ ] Facturación electrónica funcional con ${countryData.tax}
- [ ] Sistema de roles y permisos implementado
- [ ] Pruebas de carga para ${size === 'micro' ? '3' : size === 'small' ? '10' : size === 'medium' ? '30' : '100'} usuarios simultáneos
- [ ] Manual de usuario entregado
- [ ] Capacitación al equipo del cliente (mínimo 4 horas)

---

## 11. Glosario

| Término | Definición |
|---------|------------|
| SRS | Software Requirements Specification — documento de especificación de requerimientos |
| CRUD | Create, Read, Update, Delete — operaciones básicas sobre datos |
| API | Application Programming Interface — interfaz de comunicación entre sistemas |
| ${countryData.tax} | Entidad fiscal de ${countryData.label} para facturación electrónica |
| KPI | Key Performance Indicator — indicador clave de rendimiento |
| SaaS | Software as a Service — software entregado como servicio en la nube |

---

*Documento generado por Docgen · Basado en estándares IEEE 830 / ISO/IEC 29148 · ${today}*
`
}

function getTechStack(size, modules) {
  const hasEcommerce = modules.includes('ecommerce')
  const hasRealtime = modules.includes('kitchen_display') || modules.includes('gps_tracking')

  return `### 6.1 Stack recomendado

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | React + Vite | SPA reactiva, buena experiencia de usuario |
| Backend | Node.js + Express o Python + FastAPI | REST API robusta y escalable |
| Base de datos | PostgreSQL | Relacional, ACID, open source |
| ORM | Prisma (Node) o SQLAlchemy (Python) | Migraciones y queries type-safe |
| Autenticación | JWT + refresh tokens | Sin estado, escalable |
| Almacenamiento | AWS S3 o Cloudflare R2 | Archivos adjuntos y PDFs |
| Hosting | Vercel (front) + Railway o Render (back) | Despliegue simple, bajo costo inicial |
| CI/CD | GitHub Actions | Automatización de pruebas y despliegue |
${hasRealtime ? '| Tiempo real | Socket.io o Pusher | Necesario para módulos de cocina/tracking |\n' : ''}
### 6.2 Estructura de carpetas sugerida (monorepo)

\`\`\`
/
├── apps/
│   ├── web/          # Frontend React
│   └── api/          # Backend REST
├── packages/
│   ├── types/        # Tipos compartidos TypeScript
│   └── utils/        # Utilidades comunes
├── docs/             # Este SRS y documentación adicional
└── README.md
\`\`\`

### 6.3 Modelo de datos — entidades principales

\`\`\`
Empresa (tenant) → Usuarios → Roles → Permisos
Empresa → Clientes → Transacciones (ventas, facturas, pagos)
Empresa → Productos/Servicios → Inventario → Movimientos
Empresa → Proveedores → Compras → Cuentas por pagar
\`\`\``
}
