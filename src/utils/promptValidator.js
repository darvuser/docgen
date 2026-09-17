// ─── PROMPT VALIDATOR ────────────────────────────────────────────────────────
// Two-layer validation: length + semantic quality

const BUSINESS_NOUNS = [
  'empresa','negocio','tienda','taller','clínica','consultorio','restaurante',
  'hotel','farmacia','ferretería','bodega','almacén','finca','oficina','agencia',
  'colegio','escuela','instituto','laboratorio','constructora','transporte',
  'distribuidora','importadora','exportadora','manufactura','producción',
  'servicio','cliente','producto','venta','compra','inventario','pedido',
  'factura','pago','entrega','despacho','orden','contrato','proyecto','obra',
  'empleado','proveedor','paciente','estudiante','conductor','vehículo',
  'camión','moto','flota','ruta','carga','mercancía','materia prima',
]

const BUSINESS_VERBS = [
  'vender','comprar','controlar','gestionar','administrar','registrar',
  'facturar','despachar','entregar','seguir','rastrear','manejar','llevar',
  'organizar','coordinar','atender','reservar','agendar','producir','fabricar',
  'distribuir','transportar','cobrar','pagar','reportar','monitorear',
  'automatizar','digitalizar','quiero','necesito','tengo','hago','trabajo',
]

export function validatePrompt(text) {
  const clean = text.trim().toLowerCase()
  const len = clean.length

  if (len < 80) {
    const remaining = 80 - len
    return {
      valid: false,
      score: Math.round((len / 80) * 40),
      message: `Necesitamos un poco más de detalle — faltan aproximadamente ${remaining} caracteres más`,
      hint: null,
    }
  }

  const hasNoun = BUSINESS_NOUNS.some(n => clean.includes(n))
  const hasVerb = BUSINESS_VERBS.some(v => clean.includes(v))
  const wordCount = clean.split(/\s+/).length

  if (!hasNoun && !hasVerb) {
    return {
      valid: false,
      score: 45,
      message: 'Cuéntanos qué hace tu empresa y qué quieres controlar o mejorar',
      hint: 'Ej: "Tengo una ferretería y quiero controlar mis ventas e inventario"',
    }
  }

  if (!hasNoun) {
    return {
      valid: false,
      score: 55,
      message: 'Menciona a qué se dedica tu empresa (ferretería, clínica, restaurante…)',
      hint: null,
    }
  }

  if (!hasVerb) {
    return {
      valid: false,
      score: 60,
      message: 'Cuéntanos qué quieres hacer o controlar con el sistema',
      hint: null,
    }
  }

  // Score based on richness
  let score = 70
  if (wordCount >= 20) score += 10
  if (wordCount >= 35) score += 10
  const nounMatches = BUSINESS_NOUNS.filter(n => clean.includes(n)).length
  if (nounMatches >= 3) score += 5
  if (nounMatches >= 5) score += 5
  score = Math.min(score, 100)

  return { valid: true, score, message: null, hint: null }
}

// ─── SECTOR DETECTOR ─────────────────────────────────────────────────────────

const SECTOR_KEYWORDS = {
  G: {
    keywords: ['ferretería','tienda','almacén','venta','retail','comercio','supermercado',
               'abarrotes','ropa','calzado','farmacia','droguería','repuesto','autopartes',
               'electrodoméstico','electrónica','tecnología','distribuidor','mayorista','minorista'],
    label: 'Comercio y retail',
    icon: '🏪',
  },
  H: {
    keywords: ['transporte','camión','flota','carga','logística','conductor','ruta','flete',
               'despacho','entrega','mensajería','courier','tracking','seguimiento','bodega logística'],
    label: 'Transporte y logística',
    icon: '🚛',
  },
  I: {
    keywords: ['restaurante','comida','cocina','mesa','menú','plato','bebida','bar','café',
               'hotel','hospedaje','habitación','catering','evento gastronómico','fast food'],
    label: 'Restaurantes y hotelería',
    icon: '🍽️',
  },
  Q: {
    keywords: ['clínica','consultorio','médico','paciente','cita médica','historia clínica',
               'salud','odontología','dental','veterinaria','farmacia clínica','gym','gimnasio',
               'estética','spa','bienestar','terapia'],
    label: 'Salud y bienestar',
    icon: '🏥',
  },
  P: {
    keywords: ['colegio','escuela','instituto','universidad','estudiante','alumno','matrícula',
               'clase','curso','docente','profesor','educación','academia','capacitación'],
    label: 'Educación y formación',
    icon: '🎓',
  },
  C: {
    keywords: ['manufactura','fábrica','producción','fabricar','elaborar','procesar','ensamblar',
               'planta','taller industrial','maquinaria','producto terminado','materia prima','bom'],
    label: 'Manufactura y producción',
    icon: '🏭',
  },
  F: {
    keywords: ['construcción','obra','edificio','infraestructura','contratista','ingeniero de obra',
               'arquitecto','remodelación','acabados','presupuesto de obra','subcontratista'],
    label: 'Construcción',
    icon: '🏗️',
  },
  M: {
    keywords: ['consultoría','consultor','asesoría','abogado','contador','auditor','agencia',
               'marketing','publicidad','diseño','arquitectura','ingeniería','proyecto profesional'],
    label: 'Servicios profesionales',
    icon: '💼',
  },
  J: {
    keywords: ['software','desarrollo','programación','aplicación','app','tecnología','startup',
               'saas','plataforma digital','api','sistemas','it','soporte técnico','helpdesk'],
    label: 'Tecnología y software',
    icon: '💻',
  },
  A: {
    keywords: ['finca','cultivo','agricultura','ganadería','cosecha','siembra','granja',
               'agrícola','pecuario','pesca','agro','campo','parcela'],
    label: 'Agricultura y ganadería',
    icon: '🌾',
  },
}

export function detectSector(promptText) {
  const clean = promptText.toLowerCase()
  const scores = {}

  Object.entries(SECTOR_KEYWORDS).forEach(([isic, data]) => {
    const matches = data.keywords.filter(kw => clean.includes(kw)).length
    if (matches > 0) scores[isic] = matches
  })

  if (Object.keys(scores).length === 0) return null

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  const [isic, matchCount] = best
  const confidence = matchCount >= 3 ? 'alta' : matchCount === 2 ? 'media' : 'baja'

  return {
    isic,
    label: SECTOR_KEYWORDS[isic].label,
    icon: SECTOR_KEYWORDS[isic].icon,
    confidence,
    matchCount,
  }
}
