import { useState, useEffect } from 'react'
import { validatePrompt, detectSector } from '../utils/promptValidator.js'

const EXAMPLES = [
  'Tengo una ferretería en Guatemala con 8 empleados. Actualmente registro las ventas en cuadernos y el inventario en Excel. Quiero controlar mis ventas, saber qué productos tengo en bodega, quiénes me deben y emitir facturas electrónicas.',
  'Tengo una clínica dental con 3 odontólogos. Quiero controlar las citas de los pacientes, su historial clínico, cobros y facturación. Actualmente todo lo hacemos en papel y se nos pierden citas.',
  'Tenemos una empresa de transporte de carga. Manejamos 12 camiones y necesito saber dónde está cada uno, qué órdenes tienen asignadas y controlar el mantenimiento de la flota.',
  'Tengo un restaurante con 6 mesas. Quiero que los meseros tomen los pedidos desde el celular, que lleguen directo a cocina y poder cerrar la cuenta con factura electrónica.',
]

export default function StepPrompt({ data, update, onNext }) {
  const [validation, setValidation] = useState({ valid: false, score: 0, message: null, hint: null })
  const [sectorSuggestion, setSectorSuggestion] = useState(null)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    if (data.prompt.trim().length > 5) {
      const v = validatePrompt(data.prompt)
      setValidation(v)
      if (v.valid && !suggestionDismissed) {
        const detected = detectSector(data.prompt)
        setSectorSuggestion(detected)
      }
    } else {
      setValidation({ valid: false, score: 0, message: null, hint: null })
      setSectorSuggestion(null)
    }
  }, [data.prompt])

  function handleChange(e) {
    update({ prompt: e.target.value })
    setSuggestionDismissed(false)
  }

  function acceptSuggestion() {
    if (sectorSuggestion) {
      update({ detectedIndustry: sectorSuggestion.isic })
    }
    setSuggestionDismissed(true)
    setSectorSuggestion(null)
  }

  function dismissSuggestion() {
    setSuggestionDismissed(true)
    setSectorSuggestion(null)
  }

  function useExample(ex) {
    update({ prompt: ex })
    setShowExample(false)
  }

  const scoreColor = validation.score >= 80 ? 'var(--success)' : validation.score >= 50 ? '#f59e0b' : 'var(--border-strong)'
  const scoreLabel = validation.score >= 90 ? '¡Excelente detalle!' : validation.score >= 70 ? 'Buen nivel de detalle' : validation.score >= 50 ? 'Puedes agregar más detalle' : ''

  return (
    <div>
      <div className="step-header">
        <div className="step-eyebrow">Paso 1 de 4</div>
        <h1 className="step-title">Cuéntanos sobre tu negocio</h1>
        <p className="step-sub">
          Describe con tus propias palabras qué hace tu empresa y qué necesitas controlar.
          No necesitas saber de tecnología — escribe como le contarías a un amigo.
        </p>
      </div>

      <div className="card">
        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label htmlFor="prompt" style={{ marginBottom: 0 }}>¿Qué sistema necesitas?</label>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowExample(s => !s)}
              style={{ fontSize: 12, padding: '3px 10px' }}
            >
              {showExample ? 'Ocultar ejemplos' : 'Ver ejemplos'}
            </button>
          </div>

          {showExample && (
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => useExample(ex)}
                  style={{
                    textAlign: 'left', padding: '8px 12px', fontSize: 12, lineHeight: 1.5,
                    background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                    borderRadius: 6, cursor: 'pointer', color: 'var(--text-2)', fontFamily: 'inherit',
                  }}
                >
                  {ex.substring(0, 120)}…
                </button>
              ))}
            </div>
          )}

          <textarea
            id="prompt"
            rows={5}
            placeholder="Ej: Tengo una ferretería en Guatemala con 5 empleados. Actualmente registro las ventas en cuadernos y el inventario en Excel. Quiero controlar mis ventas, saber qué productos tengo en bodega, quiénes me deben y emitir facturas..."
            value={data.prompt}
            onChange={handleChange}
            aria-describedby="prompt-feedback"
            style={{ borderColor: validation.valid ? 'var(--accent-border)' : undefined }}
          />

          {/* Progress bar */}
          {data.prompt.length > 0 && (
            <div style={{ marginTop: 8 }} id="prompt-feedback">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: scoreColor, fontWeight: 500 }}>{scoreLabel}</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{data.prompt.length} caracteres</span>
              </div>
              <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.min(validation.score, 100)}%`,
                  background: scoreColor, borderRadius: 2, transition: 'width .3s, background .3s'
                }} />
              </div>
              {validation.message && (
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6 }}>
                  💡 {validation.message}
                  {validation.hint && <em style={{ display: 'block', color: 'var(--text-3)', marginTop: 2 }}>{validation.hint}</em>}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sector suggestion */}
        {sectorSuggestion && validation.valid && (
          <div style={{
            marginTop: 4, padding: '12px 14px', background: 'var(--accent-bg)',
            border: '0.5px solid var(--accent-border)', borderRadius: 8,
            display: 'flex', alignItems: 'flex-start', gap: 10
          }}>
            <span style={{ fontSize: 20 }}>{sectorSuggestion.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-accent)', marginBottom: 4 }}>
                Detectamos que describes un negocio de <strong>{sectorSuggestion.label}</strong> — ¿es correcto?
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
                Si aceptas, pre-cargaremos el sector en el siguiente paso para ahorrarte tiempo.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={acceptSuggestion}>Sí, es correcto ✓</button>
                <button className="btn btn-secondary btn-sm" onClick={dismissSuggestion}>No, lo clasifico yo</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="btn-row">
        <button
          className="btn btn-primary btn-lg"
          onClick={onNext}
          disabled={!validation.valid}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
