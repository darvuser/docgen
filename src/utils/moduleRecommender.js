// ─── MODULE RECOMMENDER ───────────────────────────────────────────────────────
// Analyzes the user's prompt and returns recommended module IDs
// WITHOUT pre-selecting them — they appear highlighted in the UI

const KEYWORD_MODULES = {
  // Tracking / pedidos / órdenes
  'tracking': ['fleet', 'routes', 'gps_tracking', 'cargo_manifest', 'delivery'],
  'pedido': ['pos', 'sales', 'delivery', 'clients'],
  'orden': ['sales', 'service_orders', 'delivery'],
  'seguimiento': ['fleet', 'routes', 'gps_tracking'],
  'rastreo': ['gps_tracking', 'fleet'],
  'entrega': ['delivery', 'routes', 'cargo_manifest'],
  'despacho': ['delivery', 'routes', 'fleet'],
  'ruta': ['routes', 'fleet', 'gps_tracking'],

  // Inventario / stock
  'inventario': ['inventory', 'purchasing', 'reports'],
  'stock': ['inventory', 'catalog'],
  'bodega': ['inventory', 'purchasing'],
  'almacén': ['inventory', 'purchasing'],
  'producto': ['inventory', 'pos', 'catalog'],
  'mercancía': ['inventory', 'purchasing', 'cargo_manifest'],

  // Ventas / cobros
  'venta': ['pos', 'sales', 'clients', 'billing'],
  'vender': ['pos', 'sales', 'clients', 'billing'],
  'cobrar': ['billing', 'credit_control', 'reports'],
  'factura': ['billing', 'reports'],
  'pago': ['billing', 'credit_control'],
  'crédito': ['credit_control', 'clients'],

  // Clientes / CRM
  'cliente': ['clients', 'crm'],
  'contacto': ['clients', 'crm'],
  'cartera': ['credit_control', 'clients', 'reports'],

  // Transporte específico
  'camión': ['fleet', 'drivers', 'maintenance', 'routes', 'gps_tracking'],
  'vehículo': ['fleet', 'drivers', 'maintenance'],
  'conductor': ['drivers', 'fleet', 'routes'],
  'flota': ['fleet', 'drivers', 'maintenance', 'gps_tracking'],
  'flete': ['fleet', 'routes', 'billing', 'cargo_manifest'],
  'carga': ['cargo_manifest', 'fleet', 'routes'],
  'manifiesto': ['cargo_manifest', 'fleet'],
  'mantenimiento': ['maintenance', 'fleet'],

  // Salud
  'paciente': ['patients', 'appointments', 'medical_records', 'billing'],
  'cita': ['appointments', 'patients', 'scheduling'],
  'consulta': ['patients', 'medical_records', 'appointments'],
  'clínica': ['patients', 'appointments', 'medical_records', 'billing'],
  'médico': ['patients', 'medical_records', 'prescriptions'],

  // Restaurante
  'mesa': ['tables', 'pos', 'inventory'],
  'comanda': ['tables', 'kitchen_display', 'pos'],
  'cocina': ['kitchen_display', 'tables', 'inventory'],
  'menú': ['pos', 'catalog', 'inventory'],

  // Educación
  'estudiante': ['students', 'enrollments', 'grades', 'billing'],
  'alumno': ['students', 'enrollments', 'grades'],
  'matrícula': ['enrollments', 'students', 'billing'],
  'clase': ['scheduling', 'students', 'grades'],
  'nota': ['grades', 'students', 'attendance'],

  // Proyectos / servicios
  'proyecto': ['projects', 'clients', 'time_tracking', 'billing'],
  'servicio': ['service_orders', 'clients', 'billing'],
  'reparación': ['service_orders', 'inventory', 'warranty'],
  'taller': ['service_orders', 'inventory', 'maintenance'],

  // Reportes / análisis
  'reporte': ['reports'],
  'dashboard': ['reports'],
  'análisis': ['reports'],
  'kpi': ['reports'],

  // Compras / proveedores
  'proveedor': ['purchasing'],
  'compra': ['purchasing', 'inventory'],
  'cotización': ['sales', 'proposals'],

  // RRHH
  'empleado': ['payroll', 'scheduling', 'attendance'],
  'nómina': ['payroll'],
  'horario': ['scheduling', 'attendance'],

  // E-commerce
  'tienda online': ['ecommerce'],
  'web': ['ecommerce'],
  'carrito': ['ecommerce'],

  // Construcción
  'obra': ['projects', 'budget', 'subcontractors'],
  'presupuesto': ['budget', 'projects', 'reports'],
  'contratista': ['subcontractors', 'contracts'],

  // Agricultura
  'cultivo': ['field_tracking', 'harvest_planning', 'inventory'],
  'cosecha': ['harvest_planning', 'field_tracking'],
  'finca': ['field_tracking', 'harvest_planning', 'equipment'],
}

export function recommendModules(promptText) {
  if (!promptText) return []
  const clean = promptText.toLowerCase()
  const scores = {}

  Object.entries(KEYWORD_MODULES).forEach(([keyword, moduleIds]) => {
    if (clean.includes(keyword)) {
      moduleIds.forEach(id => {
        scores[id] = (scores[id] || 0) + 1
      })
    }
  })

  // Return IDs sorted by score, minimum 1 keyword match
  return Object.entries(scores)
    .filter(([, score]) => score >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
}
