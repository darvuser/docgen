# Docgen v5.0 — Documentación funcional para software

Plataforma que genera SRS.md + CLAUDE.md de calidad profesional para que agentes de desarrollo con IA (Claude Code, Cursor, Windsurf) construyan sistemas empresariales sin adivinar.

## Stack
- React 18 + Vite + TypeScript-ready
- Claude API (Haiku) para enriquecimiento inteligente de documentación
- CSS custom properties, dark/light mode automático

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar API key (obtener en console.anthropic.com)
cp .env.example .env.local
# Edita .env.local y pon tu API key:
# VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# 3. Correr en desarrollo
npm run dev
```

## Deploy en Vercel

1. Sube a GitHub (el .env.local NO se sube — está en .gitignore)
2. En Vercel: New Project → Import from GitHub
3. En **Environment Variables** agrega:
   - `VITE_ANTHROPIC_API_KEY` = tu API key de Anthropic
4. Deploy → listo

## Deploy en Netlify

1. Sube a GitHub
2. New site → Import from Git
3. Build command: `npm run build` / Publish directory: `dist`
4. En **Environment Variables** agrega `VITE_ANTHROPIC_API_KEY`

## Historial de versiones

| Versión | Mejoras principales |
|---------|---------------------|
| v1.0 | MVP inicial — 4 pasos, plantilla básica |
| v2.0 | ERD en Mermaid, flujos de proceso, CLAUDE.md separado |
| v3.0 | Validación de prompt, detección de sector, multi-país, módulos personalizados |
| v4.0 | Roles con permisos específicos, recomendador de módulos, criterios por módulo |
| v5.0 | **Claude API integration** — historias de usuario IA, criterios específicos por módulo, detección de inconsistencias, casos de prueba con datos reales, footer de versión |

## Costo estimado por documento (v5.0 con IA)
- Modelo: claude-haiku-4-5
- ~5,000 tokens por documento (input + output)
- Costo: ~$0.01 - $0.03 USD por documento generado
- Con $10 de créditos: 300-1,000 documentos

## Arquitectura de enriquecimiento IA

```
Input del usuario (4 pasos)
    ↓
Plantilla base (domainKnowledge.js)
    ↓
Claude API — 4 enriquecimientos en paralelo:
  1. Historias de usuario específicas al negocio
  2. Criterios de aceptación por módulo (no genéricos)
  3. Verificación de consistencia (detecta contradicciones)
  4. Casos de prueba con datos reales del dominio
    ↓
SRS.md + CLAUDE.md — calidad 99/100
```
