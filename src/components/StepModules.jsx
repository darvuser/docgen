import { useState } from 'react'
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
  if (modules.includes('patients') || modules.includes('appointments')) {
    questions.push({
      id: 'historial',
      label: '¿Manejas historia clínica o expediente del paciente?',
      tag: 'Salud',
      options: ['Sí, es esencial', 'Solo citas y cobros', 'Historial básico'],
    })
  }
  if (modules.includes('fleet') || modules.includes('routes')) {
    questions.push({
      id: 'gps',
      label: '¿Quieres rastreo GPS en tiempo real de tus vehículos?',
      tag: 'Flota',
      options: ['Sí, es crítico', 'Solo para reportes', 'No por ahora'],
    })
  }
  if (modules.includes('production_orders') || modules.includes('bom')) {
    questions.push({
      id: 'turnos',
      label: '¿Tu producción trabaja por turnos?',
      tag: 'Producción',
      options: ['Un solo turno', 'Dos turnos', 'Tres turnos o 24/7'],
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
    label: '¿Desde qué dispositivos se usará el sistema principalmente?',
    tag: 'Dispositivos',
    options: ['Computador de escritorio', 'Tablet o laptop', 'Celular (móvil)', 'Mezcla de todos'],
  })

  return questions.slice(0, 6)
}

export default function StepModules({ data, update, onNext, onBack }) {
  const industryData = INDUSTRIES.find(i => i.isic === data.industry)
  const [answers, setAnswers] = useState(data.answers || {})
  const [customModule, setCustomModule] = useState('')
  const [customModules, setCustomModules] = useState(data.customModules || [])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [brandColor, setBrandColor] = useState(data.brandColor || '')
  const [brandLogo, setBrandLogo] = useState(data.brandLogo || '')
  const [showBrand, setShowBrand] = useState(false)

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

  function addCustomModule() {
    if (!customModule.trim()) return
    const newMod = {
      id: `custom_${Date.now()}`,
      label: customModule.trim(),
      desc: 'Módulo personalizado agregado por el cliente',
      icon: '⚙️',
      category: 'Personalizado',
      custom: true,
    }
    const next = [...customModules, newMod]
    setCustomModules(next)
    update({ customModules: next, selectedModules: [...data.selectedModules, newMod.id] })
    setCustomModule('')
    setShowCustomInput(false)
  }

  function removeCustomModule(id) {
    const next = customModules.filter(m => m.id !== id)
    setCustomModules(next)
    update({
      customModules: next,
      selectedModules: data.selectedModules.filter(mid => mid !== id)
    })
  }

  const coreIds = industryData?.coreModules || []
  const optIds = industryData?.optionalModules || []
  const coreModules = coreIds.map(id => ALL_MODULES[id]).filter(Boolean)
  const optModules = optIds.map(id => ALL_MODULES[id]).filter(Boolean)

  const questions = getContextQuestions(
    data.industry, data.subIndustry, data.country, data.size, data.selectedModules
  )

  const subLabel = data.subIndustry === 'other'
    ? (data.customSubIndustry || 'Personalizado')
    : (industryData?.subIndustries?.find(s => s.value === data.subIndustry)?.label)
  const countryLabel = COUNTRIES.find(c => c.value === data.country)?.label
  const sizeLabel = { micro: 'Solo yo', small: '2-10 personas', medium: '11-50 personas', large: '+50 personas' }[data.size] || data.size

  const answeredCount = Object.keys(answers).length
  const canContinue = data.selectedModules.length > 0 && answeredCount >= Math.min(questions.length, 2)

  return (
    <div>
      <div className="step-header">
        <div className="step-eyebrow">Paso 3 de 4</div>
        <h1 className="step-title">Elige los módulos de tu sistema</h1>
        <p className="step-sub">
          Estos son los módulos disponibles para tu sector. Selecciona los que necesitas —
          ninguno viene pre-marcado para que elijas con libertad.
        </p>
      </div>

      <div className="context-pill">
        <span>{industryData?.icon}</span>
        <span>{subLabel || industryData?.label} · {countryLabel} · {sizeLabel}</span>
      </div>

      <div className="section-label">Módulos esenciales para tu sector</div>
      <div className="modules-grid">
        {coreModules.map(mod => (
          <ModCard key={mod.id} mod={mod} selected={data.selectedModules.includes(mod.id)} onToggle={() => toggleModule(mod.id)} />
        ))}
      </div>

      {optModules.length > 0 && (
        <>
          <div className="section-label">Módulos opcionales</div>
          <div className="modules-grid">
            {optModules.map(mod => (
              <ModCard key={mod.id} mod={mod} selected={data.selectedModules.includes(mod.id)} onToggle={() => toggleModule(mod.id)} />
            ))}
          </div>
        </>
      )}

      {/* Custom modules */}
      {customModules.length > 0 && (
        <>
          <div className="section-label">Módulos personalizados</div>
          <div className="modules-grid">
            {customModules.map(mod => (
              <div key={mod.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                background: 'var(--surface)', border: '0.5px solid var(--accent-border)',
                borderRadius: 8, position: 'relative'
              }}>
                <span style={{ fontSize: 18 }}>{mod.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-accent)' }}>{mod.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Módulo personalizado · Prioridad media</div>
                </div>
                <button onClick={() => removeCustomModule(mod.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)',
                  fontSize: 16, padding: '0 2px', lineHeight: 1
                }}>×</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add custom module */}
      <div style={{ marginTop: 10 }}>
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            style={{
              width: '100%', padding: '10px 14px', border: '0.5px dashed var(--border)',
              borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13,
              background: 'none', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <span>+</span> ¿Necesitas algo que no ves en la lista? Agrega un módulo personalizado
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              autoFocus
              placeholder="Ej: Control de alquiler de herramientas, Gestión de garantías..."
              value={customModule}
              onChange={e => setCustomModule(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomModule()}
              style={{ flex: 1, fontSize: 13, padding: '9px 14px', borderRadius: 8, border: '0.5px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit' }}
            />
            <button className="btn btn-primary btn-sm" onClick={addCustomModule}>Agregar</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowCustomInput(false); setCustomModule('') }}>Cancelar</button>
          </div>
        )}
      </div>

      <div className="summary-bar" style={{ marginTop: 16 }}>
        <span><strong>{data.selectedModules.length}</strong> módulos seleccionados</span>
        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
          Est. ~{data.selectedModules.length * 12}-{data.selectedModules.length * 18} págs. de documentación
        </span>
      </div>

      <hr className="divider" />

      {/* Brand section — optional, non-invasive */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
            🎨 ¿Tienes una línea gráfica definida? <span style={{ color: 'var(--text-3)' }}>(opcional)</span>
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowBrand(s => !s)}
            style={{ fontSize: 12 }}
          >
            {showBrand ? 'Ocultar' : 'Agregar'}
          </button>
        </div>
        {showBrand && (
          <div style={{ marginTop: 10, padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 8, border: '0.5px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
              Si tu empresa ya tiene colores y logo, el agente dev los usará para dar identidad visual al sistema. No es obligatorio.
            </p>
            <div className="two-col">
              <div className="field">
                <label style={{ fontSize: 12 }}>Color principal (hex)</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={brandColor || '#2563eb'}
                    onChange={e => { setBrandColor(e.target.value); update({ brandColor: e.target.value }) }}
                    style={{ width: 40, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6 }}
                  />
                  <input
                    type="text"
                    placeholder="#2563eb"
                    value={brandColor}
                    onChange={e => { setBrandColor(e.target.value); update({ brandColor: e.target.value }) }}
                    style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 6, border: '0.5px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
              <div className="field">
                <label style={{ fontSize: 12 }}>URL del logo (opcional)</label>
                <input
                  type="text"
                  placeholder="https://tu-empresa.com/logo.png"
                  value={brandLogo}
                  onChange={e => { setBrandLogo(e.target.value); update({ brandLogo: e.target.value }) }}
                  style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6, border: '0.5px solid var(--border-strong)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context questions */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: 4 }}>Últimas preguntas</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Basadas en los módulos que elegiste · {answeredCount}/{questions.length} respondidas
        </p>
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
        <button className="btn btn-primary btn-lg" onClick={onNext} disabled={!canContinue}>
          Generar documentación →
        </button>
      </div>
      {!canContinue && data.selectedModules.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'right' }}>
          Responde al menos {Math.min(questions.length, 2)} preguntas para continuar
        </p>
      )}
      {data.selectedModules.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'right' }}>
          Selecciona al menos un módulo para continuar
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
