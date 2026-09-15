# Docgen MVP

Plataforma de generación de documentación funcional (SRS) para pymes, lista para ser usada por agentes de desarrollo con IA.

## Stack
- React 18 + Vite
- Sin backend (100% frontend en esta versión)
- CSS custom properties (dark/light mode automático)

## Desarrollo local
```bash
npm install
npm run dev
```

## Despliegue en Vercel
1. Sube este repositorio a GitHub
2. Entra a [vercel.com](https://vercel.com) y conecta el repo
3. Framework: **Vite** — Vercel lo detecta automáticamente
4. Click en Deploy

## Despliegue en Netlify
1. Sube a GitHub
2. En Netlify: New site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`

## Estructura
```
src/
├── components/
│   ├── StepPrompt.jsx      # Paso 1: descripción libre
│   ├── StepClassify.jsx    # Paso 2: país, tamaño, industria ISIC
│   ├── StepModules.jsx     # Paso 3: selección de módulos + preguntas
│   └── StepResult.jsx      # Paso 4: SRS generado + descarga
├── data/
│   └── industries.js       # Base de datos de industrias, módulos y estándares
├── utils/
│   └── generateSRS.js      # Motor de generación del documento SRS
├── App.jsx
├── App.css
└── main.jsx
```

## Próximos pasos (roadmap)
- [ ] Integración Claude API para generación inteligente (no solo plantilla)
- [ ] Exportación a PDF
- [ ] Exportación a DOCX
- [ ] Autenticación y guardado de proyectos
- [ ] Más industrias y módulos especializados
- [ ] Versión en inglés
