import { useMemo, useState, useEffect, useCallback } from 'react'
import { generateSRS, generateFilename, generateSummary } from '../utils/generateSRS.js'
import { enrichSRS } from '../utils/aiEnricher.js'
import { INDUSTRIES, COUNTRIES, ALL_MODULES } from '../data/industries.js'
import { getDomainKnowledge } from '../data/domainKnowledge.js'

const APP_VERSION = '5.0.0'

export default function StepResult({ data, onBack, onRestart }) {
  const [confirmed, setConfirmed] = useState(false)
  const [aiState, setAiState] = useState('idle') // idle | loading | done | error | skipped
  const [aiProgress, setAiProgress] = useState('')
  const [enriched, setEnriched] = useState(null)
  const [activeTab, setActiveTab] = useState('srs')
  const [consistency, setConsistency] = useState(null)

  const summary = useMemo(() => generateSummary(data), [data])
  const industryData = INDUSTRIES.find(i => i.isic === data.industry)
  const fname = generateFilename(data.subIndustry, industryData)
  const dk = useMemo(() => getDomainKnowledge(data.industry), [data.industry])

  const hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY

  // Generate final docs — with or without enriched content
  const result = useMemo(() => {
    if (!confirmed) return null
    return generateSRS({ ...data, enriched })
  }, [confirmed, enriched])

  // Run AI enrichment after confirmation
  const runEnrichment = useCallback(async () => {
    if (!hasApiKey) { setAiState('skipped'); return }
    setAiState('loading')
    try {
      const moduleList = data.selectedModules.map(id => ALL_MODULES[id]).filter(Boolean)
      const countryLabel = COUNTRIES.find(c => c.value === data.country)?.label || data.country
      const subLabel = data.subIndustry === 'other'
        ? (data.customSubIndustry || 'Personalizado')
        : (industryData?.subIndustries?.find(s => s.value === data.subIndustry)?.label || 'General')

      const enrichedData = await enrichSRS({
        prompt: data.prompt,
        country: countryLabel,
        industry: industryData?.label || data.industry,
        subLabel,
        roles: dk.roles,
        modules: moduleList,
        answers: data.answers || {},
        onProgress: (msg) => setAiProgress(msg),
      })

      if (enrichedData.consistency?.issues?.length > 0) {
        setConsistency(enrichedData.consistency.issues)
      }
      setEnriched(enrichedData)
      setAiState('done')
    } catch (e) {
      console.error('AI enrichment failed:', e)
      setAiState('error')
    }
  }, [data, dk, industryData, hasApiKey])

  useEffect(() => {
    if (confirmed) runEnrichment()
  }, [confirmed])

  function download(content, filename) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  function copyActive() {
    const content = activeTab === 'srs' ? result.srs : result.claudeMd
    navigator.clipboard.writeText(content).then(() => alert('Copiado al portapapeles'))
  }

  // ── CONFIRMATION SCREEN ──────────────────────────────────────────────────
  if (!confirmed) {
    return (
      <div>
        <div className="step-header">
          <div className="step-eyebrow">Paso 4 de 4 — Revisión final</div>
          <h1 className="step-title">¿Todo listo? Revisa antes de generar</h1>
          <p className="step-sub">
            Confirma que esto refleja tu negocio. Si algo no está bien, vuelve a ajustarlo antes de continuar.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Tu sistema en lenguaje simple
          </div>

          <SummaryRow label="Tipo de negocio" value={summary.business} icon="🏢" />
          <SummaryRow label="Tamaño" value={summary.size} icon="👥" />
          <SummaryRow label="Usuarios del sistema" value={summary.roles.join(', ')} icon="🔑" />
          <SummaryRow label="Usuarios simultáneos" value={`Hasta ${summary.users} personas al mismo tiempo`} icon="🖥️" />
          <SummaryRow label="Facturación electrónica" value={`Integración con ${summary.tax} (${summary.currency})`} icon="🧾" />
          {summary.extraCountries.length > 0 && (
            <SummaryRow label="Países adicionales" value={`${summary.extraCountries.join(', ')} — contexto informativo`} icon="🌎" warn />
          )}

          <div style={{ borderTop: '0.5px solid var(--border)', marginTop: 14, paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              {summary.moduleCount} módulos seleccionados
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {summary.modules.map(m => (
                <span key={m} style={{ padding: '3px 10px', background: 'var(--accent-bg)', border: '0.5px solid var(--accent-border)', borderRadius: 20, fontSize: 12, color: 'var(--text-accent)' }}>{m}</span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '0.5px solid var(--border)', marginTop: 14, paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
              Entidad principal: {summary.mainEntity}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              {summary.states.map((s, i) => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ padding: '2px 10px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text-2)' }}>{s}</span>
                  {i < summary.states.length - 1 && <span style={{ color: 'var(--text-3)', fontSize: 14 }}>→</span>}
                </span>
              ))}
            </div>
          </div>

          {hasApiKey && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--success-bg)', border: '0.5px solid rgba(22,163,74,.2)', borderRadius: 8, fontSize: 12, color: 'var(--success)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span>✨</span>
              <span><strong>IA activada:</strong> Al confirmar, Claude enriquecerá automáticamente las historias de usuario, criterios de aceptación y casos de prueba con datos específicos de tu negocio.</span>
            </div>
          )}

          <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            ✅ Al confirmar, el agente de desarrollo recibirá instrucciones para construir exactamente este sistema.
            Si algo no refleja tu negocio, vuelve y ajústalo antes de continuar.
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-secondary" onClick={onBack}>← Ajustar módulos</button>
          <button className="btn btn-primary btn-lg" onClick={() => setConfirmed(true)}>
            {hasApiKey ? '✨ Confirmar y generar con IA →' : 'Confirmar y generar →'}
          </button>
        </div>
      </div>
    )
  }

  // ── AI LOADING SCREEN ────────────────────────────────────────────────────
  if (aiState === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>✨</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8, color: 'var(--text)' }}>
          Claude está enriqueciendo tu documentación
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
          Estamos generando historias de usuario específicas para tu negocio, criterios de aceptación por módulo y casos de prueba con datos reales.
        </p>
        <div style={{ maxWidth: 400, margin: '0 auto', background: 'var(--surface-2)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <LoadingSpinner />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{aiProgress || 'Iniciando...'}</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 24 }}>
          Esto toma entre 15 y 30 segundos...
        </p>
      </div>
    )
  }

  // ── RESULT SCREEN ────────────────────────────────────────────────────────
  if (!result) return null

  const wordCount = result.srs.split(/\s+/).length
  const isEnriched = aiState === 'done'

  return (
    <div>
      <div className="step-header">
        <div className="result-header">
          <h1 className="step-title" style={{ marginBottom: 0 }}>Documentación lista</h1>
          <span className="badge-ready">✓ Lista</span>
          {isEnriched && <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: '#faf5ff', color: '#7c3aed', border: '0.5px solid #e9d5ff' }}>✨ Enriquecida con IA</span>}
          {aiState === 'error' && <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, background: 'var(--surface-2)', color: 'var(--text-3)', border: '0.5px solid var(--border)' }}>Plantilla base</span>}
        </div>
        <p className="step-sub" style={{ marginTop: 6 }}>
          {summary.business} · {summary.moduleCount} módulos · ~{wordCount.toLocaleString()} palabras · 2 archivos
        </p>
      </div>

      {/* Consistency warnings */}
      {consistency && consistency.length > 0 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fffbeb', border: '0.5px solid #fcd34d', borderRadius: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#92400e', marginBottom: 8 }}>⚠️ La IA detectó {consistency.length} punto(s) a revisar antes de desarrollar:</p>
          {consistency.map((issue, i) => (
            <div key={i} style={{ fontSize: 12, color: '#78350f', marginBottom: 6, paddingLeft: 12, borderLeft: '2px solid #fcd34d' }}>
              <strong>{issue.type === 'inconsistency' ? 'Inconsistencia' : issue.type === 'gap' ? 'Hueco' : 'Conflicto'}:</strong> {issue.description}
              <br /><span style={{ color: '#92400e' }}>→ Resolución sugerida: {issue.resolution}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[
          { id: 'srs', label: '📄 SRS.md' },
          { id: 'claude', label: '🤖 CLAUDE.md' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '6px 14px', borderRadius: 20, border: '0.5px solid var(--border-strong)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            background: activeTab === tab.id ? 'var(--bg-accent)' : 'var(--surface-1)',
            color: activeTab === tab.id ? 'var(--text-accent)' : 'var(--text-secondary)'
          }}>{tab.label}</button>
        ))}
      </div>

      <div className="markdown-preview" role="region" aria-label={activeTab === 'srs' ? 'Vista previa SRS' : 'Vista previa CLAUDE.md'}>
        {activeTab === 'srs' ? result.srs : result.claudeMd}
      </div>

      <div className="section-label">Exportar</div>
      <div className="export-grid">
        <button className="export-btn" onClick={() => download(result.srs, `SRS-${fname}.md`)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
          SRS.md
        </button>
        <button className="export-btn" onClick={() => download(result.claudeMd, 'CLAUDE.md')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          CLAUDE.md
        </button>
        <button className="export-btn" onClick={() => { download(result.srs, `SRS-${fname}.md`); setTimeout(() => download(result.claudeMd, 'CLAUDE.md'), 300) }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Ambos archivos
        </button>
        <button className="export-btn" onClick={copyActive}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copiar activo
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Cómo usar con un agente dev</p>
        <ol style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
          <li>Descarga <strong>ambos archivos</strong> y colócalos en la raíz de tu proyecto</li>
          <li><strong>Claude Code:</strong> <code style={{ background: 'var(--surface)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>lee CLAUDE.md y SRS.md y construye el sistema</code></li>
          <li><strong>Cursor / Windsurf:</strong> adjunta ambos archivos al contexto y usa el mismo prompt</li>
          <li>El agente usará el ERD para generar la BD y el CLAUDE.md para las convenciones</li>
        </ol>
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={() => setConfirmed(false)}>← Ver resumen</button>
        <button className="btn btn-ghost" onClick={onRestart}>Nuevo documento</button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, icon, warn }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 13, color: warn ? '#f59e0b' : 'var(--text)' }}>{value}</div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}
