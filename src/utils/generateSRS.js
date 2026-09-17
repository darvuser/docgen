import { ALL_MODULES, COUNTRIES, SIZES, INDUSTRIES } from '../data/industries.js'
import { getDomainKnowledge } from '../data/domainKnowledge.js'

// ─── HELPERS ────────────────────────────────────────────────────────────────

function today() {
  return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}

function slug(str) {
  return (str || 'sistema').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ─── MEJORA 1: FLUJOS DE PROCESO con estados y transiciones ─────────────────

function buildProcessFlows(dk) {
  const flows = Object.values(dk.processFlows)
  return flows.map(flow => {
    const stateList = flow.states.map(s => `\`${s}\``).join(' → ')
    const transTable = flow.transitions.map(t =>
      `| ${t.from} | ${t.actor} | ${t.action} | ${t.to} |`
    ).join('\n')

    const mermaid = [
      '```mermaid',
      'stateDiagram-v2',
      ...flow.states.map(s => `    ${s.replace(/\s/g, '_')}: ${s}`),
      ...flow.transitions.map(t =>
        `    ${t.from.replace(/\s/g, '_')} --> ${t.to.replace(/\s/g, '_')} : ${t.action}`
      ),
      '```'
    ].join('\n')

    return `### ${flow.name}

**Entidad principal:** ${flow.entity}

**Estados:** ${stateList}

${mermaid}

#### Tabla de transiciones

| Estado origen | Actor responsable | Acción que dispara el cambio | Estado destino |
|---------------|-------------------|------------------------------|----------------|
${transTable}`
  }).join('\n\n---\n\n')
}

// ─── MEJORA 2: REGLAS DE NEGOCIO explícitas por industria ────────────────────

function buildBusinessRules(dk) {
  const allRules = []
  Object.values(dk.processFlows).forEach(flow => {
    flow.businessRules.forEach((rule, i) => {
      allRules.push({ flow: flow.name, rule, idx: i + 1 })
    })
  })
  const grouped = {}
  Object.values(dk.processFlows).forEach(flow => {
    grouped[flow.name] = flow.businessRules
  })
  return Object.entries(grouped).map(([flowName, rules]) => {
    return `### Reglas del proceso: ${flowName}\n\n${rules.map((r, i) => `**RN-${String(i + 1).padStart(2, '0')}:** ${r}`).join('\n\n')}`
  }).join('\n\n')
}

// ─── MEJORA 3: ERD en Mermaid ────────────────────────────────────────────────

function buildERD(dk) {
  const { entities, relations } = dk.erd
  const entityDefs = entities.map(e => {
    const attrs = e.attrs.map(a => {
      if (a === 'id') return '        string id PK'
      if (a.endsWith('_id')) return `        string ${a} FK`
      return `        string ${a}`
    }).join('\n')
    return `    ${e.name} {\n${attrs}\n    }`
  }).join('\n')
  const relDefs = relations.map(r => `    ${r}`).join('\n')

  return `\`\`\`mermaid
erDiagram
${entityDefs}

${relDefs}
\`\`\``
}

// ─── MEJORA 4: HISTORIAS DE USUARIO con rol y valor concreto ─────────────────

function buildUserStories(dk, moduleList, countryData) {
  const domainStories = dk.userStories.map((s, i) => {
    return `#### HU-${String(i + 1).padStart(2, '0')}: ${s.role} — ${s.action.substring(0, 40)}...

**Como** ${s.role}, **quiero** ${s.action} **para** ${s.value}.

**Criterios de aceptación:**
- El sistema debe permitir realizar esta acción en máximo 3 pasos
- Si falta información requerida, mostrar mensaje descriptivo indicando qué falta
- La acción debe quedar registrada en el log de auditoría con usuario y fecha`
  })

  const moduleStories = moduleList.slice(0, Math.max(0, 6 - domainStories.length)).map((mod, i) => {
    const idx = domainStories.length + i + 1
    return `#### HU-${String(idx).padStart(2, '0')}: ${mod.label}

**Como** ${dk.roles[0]}, **quiero** acceder al módulo de ${mod.label.toLowerCase()} **para** ${mod.desc.toLowerCase()} de forma organizada y sin errores.

**Criterios de aceptación:**
- Listado con búsqueda y filtros funcionales
- Formulario de creación y edición con validaciones
- Confirmación antes de eliminar registros
- Exportación a Excel o PDF disponible`
  })

  return [...domainStories, ...moduleStories].join('\n\n')
}

// ─── MEJORA 5: GLOSARIO DEL DOMINIO ─────────────────────────────────────────

function buildGlossary(dk, countryData) {
  const domainTerms = dk.glossary.map(g =>
    `| ${g.term} | ${g.def} |`
  ).join('\n')

  const techTerms = [
    `| SRS | Software Requirements Specification — este documento |`,
    `| CRUD | Create, Read, Update, Delete — operaciones básicas sobre datos |`,
    `| API | Application Programming Interface — interfaz de comunicación entre sistemas |`,
    `| ${countryData.tax} | Entidad fiscal de ${countryData.label} para facturación electrónica |`,
    `| SaaS | Software as a Service — software entregado como servicio en la nube |`,
    `| ERD | Entity Relationship Diagram — diagrama de entidades y relaciones de la base de datos |`,
    `| JWT | JSON Web Token — mecanismo de autenticación sin estado |`,
    `| KPI | Key Performance Indicator — indicador clave de rendimiento |`,
  ].join('\n')

  return `### Términos del negocio

| Término | Definición |
|---------|------------|
${domainTerms}

### Términos técnicos

| Término | Definición |
|---------|------------|
${techTerms}`
}

// ─── MEJORA 6: CLAUDE.md / archivo de instrucciones para el agente ───────────

function buildCLAUDEmd({ prompt, countryData, sizeData, industryData, subLabel, dk, selectedModules, moduleList, standards, answers }) {
  const rolesList = dk.roles.join(', ')
  const entityList = dk.erd.entities.map(e => e.name).join(', ')
  const mainFlow = Object.values(dk.processFlows)[0]
  const stateList = mainFlow?.states?.join(' | ') || ''
  const answerBlock = Object.entries(answers || {})
    .map(([q, a]) => `  - ${q}: ${a}`)
    .join('\n') || '  (Sin respuestas adicionales)'

  return `# CLAUDE.md — Instrucciones para el agente de desarrollo

## Contexto del proyecto

Estás construyendo un sistema de gestión empresarial para una empresa del sector **${industryData?.label}** (${subLabel}) en **${countryData.label}**.

**Descripción del cliente:** ${prompt || 'Ver sección 1.2 del SRS.md'}

## Stack tecnológico obligatorio

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript (o Python + FastAPI si prefieres)
- **Base de datos:** PostgreSQL (esquema basado en el ERD del SRS.md)
- **ORM:** Prisma (Node) o SQLAlchemy (Python)
- **Autenticación:** JWT con refresh tokens, roles: ${rolesList}
- **Facturación:** Integración con ${countryData.tax} (${countryData.currency})
- **Hosting:** Vercel (frontend) + Railway o Render (backend)
- **Estilos:** Tailwind CSS

## Módulos a construir (en este orden de prioridad)

${moduleList.map((m, i) => `${i + 1}. **${m.label}** — ${m.desc}`).join('\n')}

## Entidades de la base de datos

Las entidades del sistema son: **${entityList}**

El ERD completo está en la sección 6.3 del SRS.md. Úsalo para generar el schema de Prisma o las migraciones de SQLAlchemy.

## Entidad principal y sus estados

La entidad principal del sistema es **${dk.mainEntity}**.

Sus estados son: \`${stateList}\`

Implementa una columna \`estado\` tipo ENUM con estos valores exactos.

## Reglas de negocio críticas (implementar desde el inicio)

${Object.values(dk.processFlows).flatMap(f => f.businessRules).map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Contexto adicional del cliente

${answerBlock}

## Convenciones de código

- Nombres de tablas en snake_case y plural (ventas, orden_items)
- Nombres de columnas en snake_case
- Fechas siempre en UTC, mostrar en zona horaria de ${countryData.label}
- Moneda: ${countryData.currency} — guardar como entero en centavos
- Todos los endpoints REST deben incluir paginación
- Soft delete en lugar de DELETE físico (columna \`deleted_at\`)
- Cada tabla debe tener: id, created_at, updated_at, deleted_at
- Multi-tenant: toda tabla de negocio debe tener \`empresa_id\`

## Lo que NO debes hacer

- No uses localStorage para datos sensibles
- No expongas el empresa_id en URLs públicas
- No omitas validaciones de rol en endpoints del backend
- No generes datos de prueba con información real de personas
- No construyas módulos que no están en la lista de arriba sin consultarme

## Estructura de carpetas

\`\`\`
/
├── apps/
│   ├── web/              # React frontend
│   │   ├── src/
│   │   │   ├── pages/    # Una carpeta por módulo
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api/      # Clientes de la API
│   └── api/              # Backend REST
│       ├── src/
│       │   ├── routes/   # Una carpeta por módulo
│       │   ├── services/
│       │   ├── middleware/
│       │   └── db/       # Schema Prisma o modelos SQLAlchemy
├── packages/
│   └── types/            # Tipos TypeScript compartidos
├── SRS.md                # Este documento — léelo antes de empezar
└── CLAUDE.md             # Este archivo
\`\`\`

## Cómo empezar

1. Lee el SRS.md completo
2. Crea el schema de base de datos basado en el ERD de la sección 6.3
3. Implementa autenticación y roles
4. Construye los módulos en el orden de prioridad de arriba
5. Cada módulo debe tener: listado, formulario de creación, edición y eliminación (soft)
`
}

// ─── PANTALLAS CLAVE ─────────────────────────────────────────────────────────

function buildScreens(dk) {
  if (!dk.screens || dk.screens.length === 0) return '_Pantallas a definir con el equipo de diseño._'
  return dk.screens.map((s, i) => `### Pantalla ${i + 1}: ${s.name}

**Contenido y elementos:** ${s.desc}

**Usuarios que la usan:** ${dk.roles.slice(0, 2).join(', ')}`
  ).join('\n\n')
}

// ─── GENERADOR PRINCIPAL ──────────────────────────────────────────────────────

export function generateSRS({ prompt, country, size, industry, subIndustry, selectedModules, answers }) {
  const countryData  = COUNTRIES.find(c => c.value === country) || COUNTRIES[0]
  const sizeData     = SIZES.find(s => s.value === size) || SIZES[1]
  const industryData = INDUSTRIES.find(i => i.isic === industry)
  const subLabel     = industryData?.subIndustries.find(s => s.value === subIndustry)?.label || 'General'
  const dk           = getDomainKnowledge(industry)
  const standards    = industryData?.standards?.join(', ') || 'ISO 9001'
  const moduleList   = selectedModules.map(id => ALL_MODULES[id]).filter(Boolean)
  const concurrentUsers = size === 'micro' ? '3' : size === 'small' ? '10' : size === 'medium' ? '30' : '100+'

  const groupedModules = moduleList.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = []
    acc[mod.category].push(mod)
    return acc
  }, {})

  const modulesTable = Object.entries(groupedModules).map(([cat, mods]) => {
    return `### ${cat}\n\n| Módulo | Descripción | Prioridad |\n|--------|-------------|----------|\n${mods.map(m => `| ${m.label} | ${m.desc} | Alta |`).join('\n')}`
  }).join('\n\n')

  const answersBlock = answers && Object.keys(answers).length > 0
    ? Object.entries(answers).map(([q, a]) => `- **${q}:** ${a}`).join('\n')
    : '- Sin respuestas adicionales'

  const claudeMd = buildCLAUDEmd({ prompt, countryData, sizeData, industryData, subLabel, dk, selectedModules, moduleList, standards, answers })

  const srs = `# Documento de Especificación de Requerimientos de Software (SRS)
## ${subLabel} — Sistema de Gestión Empresarial

---

**Versión:** 1.0
**Fecha:** ${today()}
**País de operación:** ${countryData.label}
**Tamaño de empresa:** ${sizeData.label}
**Sector ISIC:** ${industryData?.isic || '?'} — ${industryData?.label || 'General'}
**Sub-sector:** ${subLabel}
**Estándares aplicables:** ${standards}
**Ente fiscal / facturación:** ${countryData.tax} (${countryData.currency})
**Estado:** Borrador v1.0 — listo para revisión del cliente

---

## 1. Introducción

### 1.1 Propósito

Este documento especifica los requerimientos funcionales y no funcionales del sistema de gestión solicitado. Está diseñado para ser leído y ejecutado por equipos de desarrollo humanos, agentes de desarrollo con IA (Claude Code, Cursor, Windsurf) o esquemas híbridos.

Para el agente dev: existe un archivo **CLAUDE.md** complementario con instrucciones técnicas específicas, convenciones de código y orden de construcción.

### 1.2 Descripción del negocio (palabras del cliente)

> ${prompt || 'El cliente no proporcionó descripción adicional.'}

### 1.3 Alcance

El sistema cubrirá **${moduleList.length} módulos funcionales** para una empresa del sector **${industryData?.label}** (${subLabel}) operando en **${countryData.label}**, con **${sizeData.label}**.

Usuarios del sistema y sus roles: **${dk.roles.join(', ')}**.

### 1.4 Contexto regulatorio

- **Facturación electrónica:** Integración obligatoria con ${countryData.tax} (moneda: ${countryData.currency})
- **Estándares de industria aplicables:** ${standards}
- **Normativa de protección de datos:** Ley de protección de datos vigente en ${countryData.label}

---

## 2. Descripción general del sistema

### 2.1 Perspectiva del producto

Sistema web SaaS multi-usuario y multi-empresa (multi-tenant), accesible desde navegador en desktop y móvil. Sin instalación local. Datos en la nube con respaldo automático diario.

### 2.2 Funciones principales

${moduleList.map((m, i) => `${i + 1}. **${m.label}:** ${m.desc}`).join('\n')}

### 2.3 Usuarios del sistema

| Rol | Responsabilidades principales | Nivel técnico esperado |
|-----|-------------------------------|------------------------|
${dk.roles.map(r => `| ${r} | Operación del sistema en su área | Básico a medio |`).join('\n')}

### 2.4 Restricciones generales

- Debe operar en Chrome, Firefox, Edge y Safari (últimas 2 versiones)
- Tiempo de respuesta máximo: 3 segundos por operación estándar
- Disponibilidad mínima: 99.5% mensual
- Diseño responsivo — usable desde celular (tamaño mínimo 360px)
- Todos los textos en español (${countryData.label})
- Soporte simultáneo de hasta ${concurrentUsers} usuarios activos

---

## 3. Flujos de proceso del negocio

> Esta sección es crítica para el agente dev. Define exactamente qué estados tienen las entidades principales, quién puede cambiarlos y qué reglas aplican.

${buildProcessFlows(dk)}

---

## 4. Reglas de negocio

> Estas reglas deben implementarse como validaciones en el backend, no solo en el frontend. El agente dev debe garantizar que ninguna operación de API las viole.

${buildBusinessRules(dk)}

---

## 5. Requerimientos funcionales por módulo

${modulesTable}

---

## 6. Historias de usuario

${buildUserStories(dk, moduleList, countryData)}

---

## 7. Requerimientos no funcionales

### 7.1 Rendimiento
- Carga inicial del sistema: < 3 segundos en conexión de 10 Mbps
- Generación de reportes: < 10 segundos para rangos de hasta 12 meses
- Soporte de ${concurrentUsers} usuarios activos simultáneos sin degradación

### 7.2 Seguridad
- Autenticación con JWT + refresh tokens (expiración: 8h access, 30d refresh)
- Autorización por rol y módulo (matriz de permisos CRUD por rol)
- Log de auditoría inmutable: toda operación crítica registra usuario, fecha, IP y datos anteriores/nuevos
- Encriptación TLS 1.3 en tránsito, AES-256 en reposo para datos sensibles
- Autenticación de dos factores (2FA) opcional para roles de Gerente y Administrador

### 7.3 Usabilidad
- Interfaz en español (variante ${countryData.label})
- Flujos principales completables en máximo 4 pasos / pantallas
- Mensajes de error descriptivos que indican exactamente qué falló y cómo corregirlo
- Confirmación antes de cualquier operación destructiva (eliminar, anular, cancelar)

### 7.4 Disponibilidad y respaldo
- Respaldo automático diario de base de datos (retención: 30 días)
- RTO (tiempo de recuperación): < 4 horas
- RPO (punto de recuperación): máximo 24 horas de datos

---

## 8. Modelo de datos — Diagrama Entidad-Relación

> El siguiente diagrama es legible directamente por Claude Code y Cursor para generar el schema de base de datos.

${buildERD(dk)}

### Convenciones del modelo de datos

- Toda tabla de negocio incluye: \`id\`, \`created_at\`, \`updated_at\`, \`deleted_at\` (soft delete)
- Toda tabla de negocio incluye \`empresa_id\` para soporte multi-tenant
- Moneda: valores monetarios guardados como entero en centavos (${countryData.currency})
- Fechas: almacenadas en UTC, convertidas a zona horaria local en el frontend
- \`estado\` implementado como ENUM con los valores exactos definidos en los flujos de proceso

---

## 9. Arquitectura técnica

### 9.1 Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | React 18 + Vite + TypeScript | SPA reactiva, tipado estático, ecosistema maduro |
| Backend | Node.js + Express + TypeScript | REST API, mismo lenguaje en todo el stack |
| Base de datos | PostgreSQL | Relacional, ACID, soporte nativo para JSON y enums |
| ORM | Prisma | Migraciones controladas, generación de tipos automática |
| Autenticación | JWT + bcrypt | Sin estado, escalable horizontalmente |
| Almacenamiento | Cloudflare R2 o AWS S3 | PDFs, imágenes, documentos adjuntos |
| Hosting frontend | Vercel | CI/CD automático desde GitHub |
| Hosting backend | Railway o Render | Despliegue simple, escalado automático |
| CI/CD | GitHub Actions | Pruebas automáticas en cada PR |

### 9.2 Estructura de carpetas

\`\`\`
/
├── apps/
│   ├── web/          # Frontend React
│   └── api/          # Backend REST
├── packages/
│   └── types/        # Tipos TypeScript compartidos
├── docs/
│   ├── SRS.md        # Este documento
│   └── CLAUDE.md     # Instrucciones para el agente dev
└── README.md
\`\`\`

### 9.3 Decisiones de arquitectura (ADR)

**ADR-001 — Multi-tenant por columna empresa_id**
- Decisión: separar datos por \`empresa_id\` en cada tabla, no por schema de base de datos
- Razón: simplicidad operacional, migraciones únicas, bajo costo inicial
- Consecuencia: toda query debe incluir filtro por \`empresa_id\` (implementar en middleware)

**ADR-002 — API REST con versionamiento**
- Decisión: endpoints bajo \`/api/v1/\`
- Razón: permite evolucionar la API sin romper clientes existentes

**ADR-003 — Soft delete**
- Decisión: nunca DELETE físico, usar \`deleted_at = timestamp\`
- Razón: auditoría, recuperación de datos, integridad referencial

---

## 10. Integraciones

### 10.1 Obligatorias
- **${countryData.tax}:** emisión, cancelación y consulta de documentos electrónicos en ${countryData.currency}
- **SMTP / SendGrid:** envío de facturas, estados de cuenta y notificaciones por email
- **Almacenamiento:** Cloudflare R2 o AWS S3 para PDFs y archivos adjuntos

### 10.2 Opcionales (Fase 2)
- WhatsApp Business API: envío de estados de cuenta y confirmaciones
- Pasarela de pagos en línea (Stripe, PayU u otro según ${countryData.label})
- Exportación contable: XML o CSV compatible con software contable local

---

## 11. Pantallas principales

${buildScreens(dk)}

---

## 12. Información adicional del cliente

${answersBlock}

---

## 13. Criterios de aceptación globales

- [ ] Todos los módulos listados implementados y probados con datos reales
- [ ] Facturación electrónica funcional y validada con ${countryData.tax}
- [ ] Todos los flujos de estado de la sección 3 implementados correctamente
- [ ] Todas las reglas de negocio de la sección 4 validadas en el backend
- [ ] Sistema de roles y permisos implementado y probado por rol
- [ ] Pruebas de carga para ${concurrentUsers} usuarios simultáneos sin degradación
- [ ] Log de auditoría funcionando para todas las operaciones críticas
- [ ] ERD implementado fielmente en la base de datos de producción
- [ ] Manual de usuario entregado
- [ ] Capacitación al equipo (mínimo 4 horas)

---

## 14. Glosario

${buildGlossary(dk, countryData)}

---

*Documento generado por Docgen · Estándar IEEE 830 / ISO/IEC 29148 · ${today()}*
`

  return { srs, claudeMd }
}

export function generateFilename(subIndustry, industryData) {
  const label = industryData?.subIndustries?.find(s => s.value === subIndustry)?.label
    || industryData?.label
    || 'sistema'
  return slug(label)
}
