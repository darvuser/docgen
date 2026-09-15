import { COUNTRIES, SIZES, INDUSTRIES } from '../data/industries.js'

export default function StepClassify({ data, update, onNext, onBack }) {
  const selectedIndustry = INDUSTRIES.find(i => i.isic === data.industry)
  const canContinue = data.country && data.size && data.industry && data.subIndustry

  return (
    <div>
      <div className="step-header">
        <div className="step-eyebrow">Paso 2 de 4</div>
        <h1 className="step-title">Clasifica tu empresa</h1>
        <p className="step-sub">Con estos datos el sistema selecciona automáticamente los estándares, módulos y regulaciones que aplican a tu negocio.</p>
      </div>

      <div className="card">
        <div className="two-col">
          <div className="field">
            <label htmlFor="country">País donde opera tu empresa</label>
            <select
              id="country"
              value={data.country}
              onChange={e => update({ country: e.target.value })}
            >
              <option value="">Selecciona un país</option>
              {COUNTRIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

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
              <option value="">Elige el más cercano a tu negocio</option>
              {selectedIndustry.subIndustries.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {canContinue && (
          <div className="infer-chip" style={{ marginTop: 4 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Perfil detectado — módulos y estándares pre-seleccionados para tu sector
          </div>
        )}
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>← Volver</button>
        <button className="btn btn-primary btn-lg" onClick={onNext} disabled={!canContinue}>
          Ver módulos sugeridos →
        </button>
      </div>
    </div>
  )
}
