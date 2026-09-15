export default function StepPrompt({ data, update, onNext }) {
  const canContinue = data.prompt.trim().length > 10

  return (
    <div>
      <div className="step-header">
        <div className="step-eyebrow">Paso 1 de 4</div>
        <h1 className="step-title">Cuéntanos sobre tu negocio</h1>
        <p className="step-sub">Describe con tus propias palabras qué hace tu empresa y qué necesitas del sistema. No necesitas saber de tecnología.</p>
      </div>

      <div className="card">
        <div className="field">
          <label htmlFor="prompt">¿Qué sistema necesitas?</label>
          <textarea
            id="prompt"
            rows={5}
            placeholder="Ej: Tengo una ferretería en Guatemala con 5 empleados. Actualmente registro las ventas en cuadernos y el inventario en Excel. Quiero controlar mis ventas, saber qué productos tengo en bodega, saber quiénes me deben y emitir facturas..."
            value={data.prompt}
            onChange={e => update({ prompt: e.target.value })}
            aria-describedby="prompt-hint"
          />
          <p className="form-hint" id="prompt-hint">
            Mientras más detalles incluyas, más precisa será la documentación. Puedes mencionar procesos actuales, problemas, número de usuarios, integraciones que necesitas, etc.
          </p>
        </div>
      </div>

      <div className="btn-row">
        <button
          className="btn btn-primary btn-lg"
          onClick={onNext}
          disabled={!canContinue}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
