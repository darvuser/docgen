import { useState } from 'react'
import StepPrompt from './components/StepPrompt'
import StepClassify from './components/StepClassify'
import StepModules from './components/StepModules'
import StepResult from './components/StepResult'
import './App.css'

const STEPS = [
  { id: 0, label: 'Tu negocio' },
  { id: 1, label: 'Clasificación' },
  { id: 2, label: 'Módulos' },
  { id: 3, label: 'Documento' },
]

const INITIAL = {
  prompt: '',
  country: '',
  extraCountries: [],
  size: '',
  industry: '',
  detectedIndustry: null,
  subIndustry: '',
  customSubIndustry: '',
  selectedModules: [],
  customModules: [],
  answers: {},
  brandColor: '',
  brandLogo: '',
}

const APP_VERSION = '5.0.0'

export default function App() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(INITIAL)

  function update(fields) {
    setData(prev => ({ ...prev, ...fields }))
  }

  // Auto-apply detected industry when moving to step 2
  function next() {
    if (step === 0 && data.detectedIndustry && !data.industry) {
      update({ industry: data.detectedIndustry })
    }
    setStep(s => Math.min(s + 1, 3))
  }
  function back() { setStep(s => Math.max(s - 1, 0)) }
  function goTo(n) { if (n <= step) setStep(n) }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="7" height="9" rx="1.5" fill="currentColor" opacity=".9"/>
              <rect x="11" y="2" width="7" height="5" rx="1.5" fill="currentColor" opacity=".5"/>
              <rect x="2" y="13" width="7" height="5" rx="1.5" fill="currentColor" opacity=".5"/>
              <rect x="11" y="9" width="7" height="9" rx="1.5" fill="currentColor" opacity=".75"/>
            </svg>
            <span>Docgen</span>
          </div>
          <nav className="steps-nav" aria-label="Pasos del proceso">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className={`step-btn ${step === i ? 'active' : ''} ${step > i ? 'done' : ''} ${step < i ? 'locked' : ''}`}
                onClick={() => goTo(i)}
                disabled={step < i}
                aria-current={step === i ? 'step' : undefined}
              >
                <span className="step-indicator">
                  {step > i ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : i + 1}
                </span>
                <span className="step-label">{s.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ width: 80 }} />
        </div>
      </header>

      <main className="main">
        {step === 0 && <StepPrompt data={data} update={update} onNext={next} />}
        {step === 1 && <StepClassify data={data} update={update} onNext={next} onBack={back} />}
        {step === 2 && <StepModules data={data} update={update} onNext={next} onBack={back} />}
        {step === 3 && <StepResult data={data} onBack={back} onRestart={() => { setStep(0); setData(INITIAL) }} />}
      </main>

      <footer className="footer">
        Docgen — Documentación funcional para software
        <span className="footer-version">v{APP_VERSION}</span>
      </footer>
    </div>
  )
}
