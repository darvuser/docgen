import { useState } from 'react'
import { COUNTRIES, SIZES, INDUSTRIES } from '../data/industries.js'

export default function StepClassify({ data, update, onNext, onBack }) {
  const [extraCountries, setExtraCountries] = useState(data.extraCountries || [])
  const [showExtraCountry, setShowExtraCountry] = useState(false)

  const selectedIndustry = INDUSTRIES.find(i => i.isic === data.industry)
  const canContinue = data.country && data.size && data.industry && data.subIndustry

  // Auto-fill from detected industry in step 1
  const detectedIndustry = data.detectedIndustry

  function addExtraCountry(val) {
    if (!val || extraCountries.includes(val) || val === data.country) return
    const next = [...extraCountries, val]
    setExtraCountries(next)
    update({ extraCountries: next })
  }

  function removeExtraCountry(val) {
    const next = extraCountries.filter(c => c !== val)
    setExtraCountries(next)
    update({ extraCountries: next })
  }

  const availableExtraCountries = COUNTRIES.filter(c => c.value !== data.country && !extraCountries.includes(c.value))

  return (
    <div>
      <div className="step-header">
        <div className="step-eyebrow">Paso 2 de 4</div>
        <h1 className="step-title">Clasifica tu empresa</h1>
        <p className="step-sub">
          Con estos datos el sistema selecciona automáticamente los estándares, módulos
          y regulaciones que aplican a tu negocio.
        </p>
      </div>

      {/* Auto-detection notice */}
      {detectedIndustry && data.industry === detectedIndustry && (
        <div className="infer-chip" style={{ marginBottom: 16, display: 'inline-flex' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sector pre-cargado desde tu descripción — puedes cambiarlo si no es correcto
        </div>
      )}

      <div className="card">
        {/* Country — primary + multi-country */}
        <div className="field">
          <label htmlFor="country">País principal de operación <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(sede legal y facturación)</span></label>
          <select
            id="country"
            value={data.country}
            onChange={e => update({ country: e.target.value })}
          >
            <option value="">Selecciona el país principal</option>
            {COUNTRIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Extra countries */}
        {data.country && (
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ marginBottom: 0, color: 'var(--text-3)', fontSize: 12 }}>
                ¿Tu empresa también opera en otros países?
              </label>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, padding: '2px 8px' }}
                onClick={() => setShowExtraCountry(s => !s)}
              >
                {showExtraCountry ? 'Cancelar' : '+ Agregar país'}
              </button>
            </div>
            {extraCountries.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {extraCountries.map(c => {
                  const country = COUNTRIES.find(co => co.value === c)
                  return (
                    <span key={c} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '3px 10px', background: 'var(--surface-2)',
                      border: '0.5px solid var(--border)', borderRadius: 20,
                      fontSize: 12, color: 'var(--text-2)'
                    }}>
                      {country?.label}
                      <button onClick={() => removeExtraCountry(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  )
                })}
              </div>
            )}
            {showExtraCountry && (
              <select
                onChange={e => { addExtraCountry(e.target.value); setShowExtraCountry(false) }}
                defaultValue=""
                style={{ fontSize: 13 }}
              >
                <option value="">Selecciona un país adicional</option>
                {availableExtraCountries.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            )}
            {extraCountries.length > 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                ⚠️ La documentación se generará con las reglas fiscales de {COUNTRIES.find(c => c.value === data.country)?.label}. 
                Los países adicionales se incluirán como nota de contexto — consulta un experto legal local para cada país.
              </p>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="size">Personas en tu empresa</label>
          <select
            id="size"
            value={data.size}
            onChange={e => update({ size: e.target.value })}
          >
            <option value="">¿Cuántas son?</option>
            {SIZES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="industry">Sector de tu empresa</label>
          <select
            id="industry"
            value={data.industry}
            onChange={e => update({ industry: e.target.value, subIndustry: '' })}
          >
            <option value="">Selecciona el sector</option>
            {INDUSTRIES.map(i => (
              <option key={i.isic} value={i.isic}>{i.icon} {i.label}</option>
            ))}
          </select>
          <p className="form-hint">Clasificación ISIC/CIIU — estándar internacional de industrias</p>
        </div>

        {selectedIndustry && (
          <div className="field">
            <label htmlFor="subindustry">Sub-sector (más específico)</label>
            <select
              id="subindustry"
              value={data.subIndustry}
              onChange={e => update({ subIndustry: e.target.value })}
            >
              <option value="">Elige el que mejor describe tu negocio</option>
              {selectedIndustry.subIndustries.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
              <option value="other">Otro — mi caso no está en la lista</option>
            </select>
          </div>
        )}

        {/* Custom sub-sector text */}
        {data.subIndustry === 'other' && (
          <div className="field">
            <label htmlFor="customSub">Describe brevemente tu tipo de negocio</label>
            <input
              type="text"
              id="customSub"
              placeholder="Ej: Lavandería industrial para hoteles"
              value={data.customSubIndustry || ''}
              onChange={e => update({ customSubIndustry: e.target.value })}
              style={{ fontSize: 14, padding: '9px 14px' }}
            />
          </div>
        )}

        {canContinue && (
          <div className="infer-chip" style={{ marginTop: 4 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Perfil completo — estándares y regulaciones identificados para tu sector
          </div>
        )}
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>← Volver</button>
        <button
          className="btn btn-primary btn-lg"
          onClick={onNext}
          disabled={!canContinue || (data.subIndustry === 'other' && !data.customSubIndustry?.trim())}
        >
          Ver módulos →
        </button>
      </div>
    </div>
  )
}
