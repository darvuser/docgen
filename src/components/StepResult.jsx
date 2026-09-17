import { useMemo, useState } from 'react'
import { generateSRS, generateFilename } from '../utils/generateSRS.js'
import { INDUSTRIES, COUNTRIES } from '../data/industries.js'

export default function StepResult({ data, onBack, onRestart }) {
  const [activeTab, setActiveTab] = useState('srs')
  const result = useMemo(() => generateSRS(data), [data])
  const { srs, claudeMd } = result

  const industryData = INDUSTRIES.find(i => i.isic === data.industry)
  const subLabel = industryData?.subIndustries?.find(s => s.value === data.subIndustry)?.label
  const countryData = COUNTRIES.find(c => c.value === data.country)
  const fname = generateFilename(data.subIndustry, industryData)

  const wordCount = srs.split(/\s+/).length
  const lineCount = srs.split('\n').length

  function download(content, filename, type = 'text/markdown') {
    const blob = new Blob([content], { type: `${type};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function copyActive() {
    const content = activeTab === 'srs' ? srs : claudeMd
    navigator.clipboard.writeText(content).then(() => alert('Copiado al portapapeles'))
  }

  const activeContent = activeTab === 'srs' ? srs : claudeMd

  return (
    <div>
      <div className="step-header">
        <div className="result-header">
          <h1 className="step-title" style={{ marginBottom: 0 }}>Documentación lista</h1>
          <span className="badge-ready">✓ Lista</span>
        </div>
        <p className="step-sub" style={{ marginTop: 6 }}>
          {subLabel || industryData?.label} · {countryData?.label} · {data.selectedModules.length} módulos
          · ~{wordCount.toLocaleString()} palabras · {lineCount} líneas · 2 archivos generados
        </p>
      </div>

      <div className="context-pill">
        <span>{industryData?.icon}</span>
        <span>{industryData?.standards?.slice(0, 2).join(' · ')} · {countryData?.tax}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[
          { id: 'srs', label: '📄 SRS.md — Para humanos y agentes' },
          { id: 'claude', label: '🤖 CLAUDE.md — Solo para el agente dev' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`sc-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '0.5px solid var(--border-strong)',
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              background: activeTab === tab.id ? 'var(--bg-accent)' : 'var(--surface-1)',
              color: activeTab === tab.id ? 'var(--text-accent)' : 'var(--text-secondary)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="markdown-preview" role="region" aria-label={activeTab === 'srs' ? 'Vista previa SRS' : 'Vista previa CLAUDE.md'}>
        {activeContent}
      </div>

      <div className="section-label">Exportar documentación</div>
      <div className="export-grid">
        <button className="export-btn" onClick={() => download(srs, `SRS-${fname}.md`)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
          Descargar SRS.md
        </button>
        <button className="export-btn" onClick={() => download(claudeMd, 'CLAUDE.md')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Descargar CLAUDE.md
        </button>
        <button className="export-btn" onClick={() => { download(srs, `SRS-${fname}.md`); setTimeout(() => download(claudeMd, 'CLAUDE.md'), 300) }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Descargar ambos
        </button>
        <button className="export-btn" onClick={copyActive}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copiar activo
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Cómo usar con un agente dev</p>
        <ol style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
          <li>Descarga <strong>ambos archivos</strong> y colócalos en la raíz de tu proyecto</li>
          <li>En Claude Code escribe: <code style={{ background: 'var(--surface)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>lee CLAUDE.md y SRS.md y construye el sistema</code></li>
          <li>En Cursor: agrega ambos al contexto y usa el mismo prompt</li>
          <li>El agente usará el ERD del SRS para generar la base de datos y el CLAUDE.md para las convenciones de código</li>
        </ol>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>← Editar módulos</button>
        <button className="btn btn-ghost" onClick={onRestart}>Nuevo documento</button>
      </div>
    </div>
  )
}
