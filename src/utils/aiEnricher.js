// ─── AI ENRICHER — V5 ────────────────────────────────────────────────────────
// Calls Claude API to enrich specific SRS sections that templates can't handle:
// 1. Specific user stories for this exact client
// 2. Per-module acceptance tests with real data examples
// 3. Consistency check — detects and resolves contradictions
// 4. Test cases with client's business data
//
// Uses claude-haiku-4-5 for speed and cost (~$0.01-0.03 per document)
// API key is injected at runtime via import.meta.env.VITE_ANTHROPIC_API_KEY

const MODEL = 'claude-haiku-4-5'
const API_URL = 'https://api.anthropic.com/v1/messages'

function getApiKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY
}

async function callClaude(systemPrompt, userPrompt, maxTokens = 1500) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API_KEY_MISSING')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

// ── 1. SPECIFIC USER STORIES ─────────────────────────────────────────────────

export async function enrichUserStories({ prompt, industry, subLabel, roles, modules, country, answers }) {
  const system = `Eres un analista de negocios experto con 20 años de experiencia documentando sistemas empresariales en Latinoamérica. 
Generas historias de usuario ULTRA ESPECÍFICAS basadas en el negocio real del cliente.
NUNCA uses frases genéricas como "para mejorar la gestión de mi negocio".
Cada historia debe reflejar el contexto real: el sector, el país, los procesos y el lenguaje que usa esa industria.
Responde SOLO en Markdown, sin explicaciones adicionales.`

  const user = `Genera 8 historias de usuario específicas para este cliente:

SECTOR: ${industry} — ${subLabel}
PAÍS: ${country}
DESCRIPCIÓN DEL CLIENTE: "${prompt}"
ROLES EN EL SISTEMA: ${roles.join(', ')}
MÓDULOS SELECCIONADOS: ${modules.join(', ')}
RESPUESTAS DEL CLIENTE: ${JSON.stringify(answers)}

Formato para cada historia:
#### HU-XX: [Rol] — [Acción concreta en 5-8 palabras]
**Como** [rol específico], **quiero** [acción muy concreta con detalles del negocio] **para** [valor real y medible para el negocio].
**Criterios de aceptación:**
- [criterio específico con datos del dominio]
- [criterio específico con datos del dominio]
- [criterio específico con datos del dominio]

Usa terminología real de la industria ${industry} en ${country}. Incluye números, tiempos o métricas reales cuando aplique.`

  return await callClaude(system, user, 2000)
}

// ── 2. PER-MODULE ACCEPTANCE TESTS ───────────────────────────────────────────

export async function enrichModuleTests({ modules, industry, subLabel, prompt, country, answers }) {
  const system = `Eres un experto en QA y testing de software empresarial para pymes latinoamericanas.
Generas criterios de aceptación ESPECÍFICOS por módulo, no genéricos.
Cada módulo tiene funcionalidades distintas y sus criterios deben reflejar eso.
Un dashboard NO tiene "formulario de creación". Un GPS tracker NO tiene "exportar a Excel" como criterio principal.
Responde SOLO en Markdown, sin explicaciones adicionales.`

  const modList = modules.map((m, i) => `${i + 1}. ${m.label} — ${m.desc}`).join('\n')

  const user = `Genera criterios de aceptación ESPECÍFICOS para cada módulo de este sistema:

NEGOCIO: ${subLabel} en ${country}
DESCRIPCIÓN: "${prompt}"
RESPUESTAS ADICIONALES: ${JSON.stringify(answers)}

MÓDULOS A DOCUMENTAR:
${modList}

Para cada módulo genera 4-6 criterios de aceptación específicos a LO QUE HACE ESE MÓDULO.
Incluye al menos un caso de prueba con datos reales del dominio (nombres de ciudades, tipos de vehículo, pesos, etc. según corresponda).

Formato:
**[Nombre del módulo]**
- [ ] [criterio específico a la función de ese módulo]
- [ ] [criterio con datos de ejemplo reales]
...`

  return await callClaude(system, user, 2000)
}

// ── 3. CONSISTENCY CHECK ──────────────────────────────────────────────────────

export async function checkConsistency({ prompt, modules, answers, industry }) {
  const system = `Eres un revisor experto de documentación de software. 
Tu trabajo es detectar inconsistencias entre lo que el cliente describió, los módulos elegidos y sus respuestas.
Eres directo y conciso. Solo reportas problemas reales, no hipotéticos.
Responde en JSON con este formato exacto:
{"issues": [{"type": "inconsistency|gap|conflict", "description": "...", "resolution": "..."}], "clean": true|false}`

  const modNames = modules.map(m => m.label).join(', ')

  const user = `Revisa la consistencia de este documento:

DESCRIPCIÓN DEL CLIENTE: "${prompt}"
INDUSTRIA: ${industry}
MÓDULOS ELEGIDOS: ${modNames}
RESPUESTAS DEL CLIENTE: ${JSON.stringify(answers)}

Detecta: contradicciones entre respuestas y módulos, módulos que no aplican dado el prompt, módulos críticos faltantes dado el prompt, respuestas que contradicen los módulos elegidos.`

  const raw = await callClaude(system, user, 800)
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { issues: [], clean: true }
  }
}

// ── 4. TEST CASES WITH REAL DATA ─────────────────────────────────────────────

export async function enrichTestCases({ prompt, modules, industry, subLabel, country, answers }) {
  const system = `Eres un QA engineer especializado en sistemas empresariales latinoamericanos.
Generas casos de prueba con datos REALES y específicos al negocio del cliente.
Usa nombres de lugares, personas, productos o términos del sector que corresponda.
Responde SOLO en Markdown, sin explicaciones adicionales.`

  const topModules = modules.slice(0, 4).map(m => m.label).join(', ')

  const user = `Genera 6 casos de prueba end-to-end con datos reales para este sistema:

NEGOCIO: ${subLabel} en ${country}
DESCRIPCIÓN: "${prompt}"
MÓDULOS PRINCIPALES: ${topModules}
CONTEXTO ADICIONAL: ${JSON.stringify(answers)}

Formato para cada caso:
**CP-XX: [Nombre del caso de prueba]**
- **Precondición:** [estado inicial del sistema]
- **Pasos:** [acciones concretas con datos reales del dominio]
- **Resultado esperado:** [qué debe pasar exactamente]
- **Módulos involucrados:** [lista]

Usa datos ficticios pero realistas del contexto ${country} y sector ${industry}.`

  return await callClaude(system, user, 1500)
}

// ── MAIN ENRICHER — runs all 4 in parallel ───────────────────────────────────

export async function enrichSRS({ prompt, country, industry, subLabel, roles, modules, answers, onProgress }) {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { error: 'NO_API_KEY', userStories: null, moduleTests: null, consistency: null, testCases: null }
  }

  onProgress?.('Analizando consistencia del documento...')

  // Run consistency check first — its result may affect other sections
  let consistency = { issues: [], clean: true }
  try {
    consistency = await checkConsistency({ prompt, modules, answers, industry })
  } catch (e) {
    console.warn('Consistency check failed:', e.message)
  }

  onProgress?.('Generando historias de usuario específicas para tu negocio...')

  // Run the three enrichments in parallel
  const [userStories, moduleTests, testCases] = await Promise.allSettled([
    enrichUserStories({ prompt, industry, subLabel, roles, modules: modules.map(m => m.label), country, answers }),
    enrichModuleTests({ modules, industry, subLabel, prompt, country, answers }),
    enrichTestCases({ prompt, modules, industry, subLabel, country, answers }),
  ])

  onProgress?.('Finalizando documento enriquecido...')

  return {
    consistency,
    userStories: userStories.status === 'fulfilled' ? userStories.value : null,
    moduleTests: moduleTests.status === 'fulfilled' ? moduleTests.value : null,
    testCases: testCases.status === 'fulfilled' ? testCases.value : null,
  }
}
