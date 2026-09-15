import { useMemo } from 'react'
import { generateSRS } from '../utils/generateSRS.js'
import { INDUSTRIES, COUNTRIES } from '../data/industries.js'

export default function StepResult({ data, onBack, onRestart }) {
  const markdown = useMemo(() => generateSRS(data), [data])

  const industryData = INDUSTRIES.find(i => i.isic === data.industry)
  const subLabel = industryData?.subIndustries?.find(s => s.value === data.subIndustry)?.label
  const countryLabel = COUNTRIES.find(c => c.value === data.country)?.label

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SRS-${(subLabel || 'sistema').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(markdown).then(() => {
      alert('Documento copiado al portapapeles')
    })
  }

  function downloadTxt() {
    const blob = new Blob([markdown], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SRS-${(subLabel || 'sistema').replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const lineCount = markdown.split('\n').length
  const wordCount = markdown.split(/\s+/).length

  return (
    <div>
      <div className="step-header">
        <div className="result-header">
          <h1 className="step-title" style={{ marginBottom: 0 }}>Documentación lista</h1>
          <span className="badge-ready">✓ Lista</span>
        </div>
        <p className="step-sub" style={{ marginTop: 6 }}>
          SRS generado para {subLabel || industryData?.label} en {countryLabel} · {data.selectedModules.length} módulos · ~{wordCount.toLocaleString()} palabras · {lineCount} líneas
        </p>
      </div>

      <div className="context-pill">
        <span>{industryData?.icon}</span>
        <span>
          {industryData?.standards?.slice(0, 2).join(' · ')} · Facturación {COUNTRIES.find(c => c.value === data.country)?.tax}
        </span>
      </div>

      <div className="markdown-preview" role="region" aria-label="Vista previa del documento SRS">
        {markdown}
      </div>

      <div className="section-label">Exportar documentación</div>
      <div className="export-grid">
        <button className="export-btn" onClick={downloadMarkdown}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
          </svg>
          Descargar .md
        </button>
        <button className="export-btn" onClick={downloadTxt}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          Descargar .txt
        </button>
        <button className="export-btn" onClick={copyToClipboard}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          Copiar texto
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>¿Cómo usar este documento con un agente dev?</p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
          1. Descarga el archivo <code style={{ background: 'var(--surface)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>.md</code> y nómbralo <code style={{ background: 'var(--surface)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>CLAUDE.md</code> o <code style={{ background: 'var(--surface)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>SRS.md</code><br/>
          2. Colócalo en la raíz de tu proyecto<br/>
          3. Abre Claude Code o Cursor y dile: <em>"Lee el archivo SRS.md y construye el sistema descrito ahí"</em>
        </p>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>← Editar módulos</button>
        <button className="btn btn-ghost" onClick={onRestart}>Nuevo documento</button>
      </div>
    </div>
  )
}
