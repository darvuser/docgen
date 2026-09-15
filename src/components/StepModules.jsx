import { useState, useEffect } from 'react'
import { INDUSTRIES, ALL_MODULES, COUNTRIES } from '../data/industries.js'

function getContextQuestions(industry, subIndustry, country, size, modules) {
  const countryData = COUNTRIES.find(c => c.value === country)
  const questions = []

  if (modules.includes('billing') || modules.includes('pos')) {
    questions.push({
      id: 'facturacion',
      label: `¿Ya emites factura electrónica con ${countryData?.tax || 'el ente fiscal'}?`,
      tag: 'Facturación',
      options: ['Sí, actualmente lo hago', 'No todavía', 'Estoy en proceso de habilitarme'],
    })
  }
  if (modules.includes('inventory')) {
    questions.push({
      id: 'bodegas',
      label: '¿Manejas inventario en más de una ubicación?',
      tag: 'Inventario',
      options: ['Una sola bodega o punto', 'Bodega + punto de venta', 'Varias sucursales o bodegas'],
    })
  }
  if (modules.includes('clients') || modules.includes('credit_control')) {
    questions.push({
      id: 'credito',
      label: '¿Vendes a crédito a tus clientes?',
      tag: 'Clientes',
      options: ['No, solo contado', 'Sí, a algunos clientes', 'La mayoría compra a crédito'],
    })
  }
  if (modules.includes('payroll')) {
    questions.push({
      id: 'nomina',
      label: '¿Cómo pagas actualmente a tus empleados?',
      tag: 'Nómina',
      options: ['Salario fijo mensual', 'Salario + comisiones', 'Por horas o días trabajados'],
    })
  }
  if (modules.includes('ecommerce')) {
    questions.push({
      id: 'ecommerce',
      label: '¿Ya tienes tienda online o es nueva?',
      tag: 'E-commerce',
      options: ['Es completamente nueva', 'Ya tengo una y quiero migrar', 'Es adicional a mi sistema actual'],
    })
  }
  if (modules.includes('delivery') || modules.includes('routes')) {
    questions.push({
      id: 'delivery',
      label: '¿Con qué realizas las entregas a domicilio?',
      tag: 'Despachos',
      options: ['Vehículo propio (moto o camión)', 'Servicio de mensajería externo', 'Ambos según el pedido'],
    })
  }
  questions.push({
    id: 'usuarios',
    label: '¿Cuántas personas usarán el sistema al mismo tiempo?',
    tag: 'Acceso',
    options: ['1 a 3 usuarios', '4 a 10 usuarios', 'Más de 10 usuarios'],
  })
  questions.push({
    id: 'dispositivos',
    label: '¿Desde qué dispositivos se usará principalmente el sistema?',
    tag: 'Dispositivos',
    options: ['Computador de escritorio', 'Tablet o laptop', 'Celular (móvil)', 'Mezcla de todos'],
  })

  return questions.slice(0, 5)
}

export default function StepModules({ data, update, onNext, onBack }) {
  const industryData = INDUSTRIES.find(i => i.isic === data.industry)
  const [answers, setAnswers] = useState(data.answers || {})

  useEffect(() => {
    if (!industryData) return
    if (data.selectedModules.length === 0) {
      const defaultModules = [
        ...(industryData.coreModules || []),
        ...(industryData.optionalModules || []).slice(0, 2),
      ]
      update({ selectedModules: defaultModules })
    }
  }, [])

  function toggleModule(id) {
    const current = data.selectedModules
    const next = current.includes(id)
      ? current.filter(m => m !== id)
      : [...current, id]
    update({ selectedModules: next })
  }

  function setAnswer(qId, val) {
    const next = { ...answers, [qId]: val }
    setAnswers(next)
    update({ answers: next })
  }

  const coreIds = industryData?.coreModules || []
  const optIds = industryData?.optionalModules || []
  const coreModules = coreIds.map(id => ALL_MODULES[id]).filter(Boolean)
  const optModules = optIds.map(id => ALL_MODULES[id]).filter(Boolean)

  const questions = getContextQuestions(
    data.industry, data.subIndustry, data.country, data.size, data.selectedModules
  )

  const subLabel = industryData?.subIndustries?.find(s => s.value === data.subIndustry)?.label
  const countryLabel = COUNTRIES.find(c => c.value === data.country)?.label
  const sizeLabel = ['', 'Solo yo', '2-10 personas', '11-50 personas', '+50 personas'][
    ['', 'micro', 'small', 'medium', 'large'].indexOf(data.size)
  ] || data.size

  const canContinue = data.selectedModules.length > 0 && Object.keys(answers).length >= Math.min(questions.length, 2)

  return (
    <div>
      <div className="step-header">
        <div className="step-eyebrow">Paso 3 de 4</div>
        <h1 className="step-title">Selecciona los módulos de tu sistema</h1>
        <p className="step-sub">Pre-seleccionamos los módulos típicos de tu sector. Ajusta según lo que realmente necesitas.</p>
      </div>

      <div className="context-pill">
        <span>{industryData?.icon}</span>
        <span>{subLabel || industryData?.label} · {countryLabel} · {sizeLabel}</span>
      </div>

      <div className="section-label">Módulos esenciales para tu sector</div>
      <div className="modules-grid">
        {coreModules.map(mod => (
          <ModCard
            key={mod.id}
            mod={mod}
            selected={data.selectedModules.includes(mod.id)}
            onToggle={() => toggleModule(mod.id)}
          />
        ))}
      </div>

      {optModules.length > 0 && (
        <>
          <div className="section-label">Módulos opcionales</div>
          <div className="modules-grid">
            {optModules.map(mod => (
              <ModCard
                key={mod.id}
                mod={mod}
                selected={data.selectedModules.includes(mod.id)}
                onToggle={() => toggleModule(mod.id)}
              />
            ))}
          </div>
        </>
      )}

      <div className="summary-bar">
        <span><strong>{data.selectedModules.length}</strong> módulos seleccionados</span>
        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
          Est. ~{data.selectedModules.length * 12}-{data.selectedModules.length * 18} págs. de documentación
        </span>
      </div>

      <hr className="divider" />

      <div className="step-header" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Últimas preguntas</h2>
        <p className="step-sub" style={{ fontSize: 14 }}>Basadas en los módulos que elegiste — máximo {questions.length} preguntas.</p>
      </div>

      {questions.map(q => (
        <div className="q-card" key={q.id}>
          <div className="q-label">
            {q.label}
            <span className="q-tag">{q.tag}</span>
          </div>
          <div className="q-opts">
            {q.options.map(opt => (
              <button
                key={opt}
                className={`q-opt ${answers[q.id] === opt ? 'selected' : ''}`}
                onClick={() => setAnswer(q.id, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>← Volver</button>
        <button
          className="btn btn-primary btn-lg"
          onClick={onNext}
          disabled={!canContinue}
        >
          Generar documentación →
        </button>
      </div>
      {!canContinue && data.selectedModules.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'right' }}>
          Responde al menos {Math.min(questions.length, 2)} preguntas para continuar
        </p>
      )}
    </div>
  )
}

function ModCard({ mod, selected, onToggle }) {
  return (
    <button
      className={`mod-card ${selected ? 'selected' : ''}`}
      onClick={onToggle}
      aria-pressed={selected}
      title={mod.desc}
    >
      <span className="mod-icon" aria-hidden="true">{mod.icon}</span>
      <div className="mod-body">
        <div className="mod-name">{mod.label}</div>
        <div className="mod-desc">{mod.desc}</div>
      </div>
      <div className="mod-check" aria-hidden="true">
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  )
}
