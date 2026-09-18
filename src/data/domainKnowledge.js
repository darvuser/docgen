// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN KNOWLEDGE — per industry
// Feeds: process flows, business rules, ERD, glossary, user stories, CLAUDE.md
// Key: ISIC section letter
// ─────────────────────────────────────────────────────────────────────────────

export const DOMAIN_KNOWLEDGE = {

  // ── COMERCIO Y RETAIL (G) ──────────────────────────────────────────────────
  G: {
    mainEntity: 'Venta',
    roles: ['Vendedor', 'Jefe de bodega', 'Gerente', 'Contador'],
    roleDetails: [
      { role: 'Vendedor', responsibilities: 'Registrar ventas en POS, atender clientes, emitir recibos y gestionar devoluciones simples', permissions: 'Crear y completar ventas · Ver inventario · Consultar clientes · No puede anular ni aplicar descuentos >20%' },
      { role: 'Jefe de bodega', responsibilities: 'Controlar entradas y salidas de inventario, recibir compras, hacer conteos de inventario y gestionar proveedores', permissions: 'CRUD inventario · Crear y recibir órdenes de compra · Ver reportes de stock · No puede anular ventas' },
      { role: 'Gerente', responsibilities: 'Supervisar operaciones, aprobar descuentos y anulaciones, revisar reportes y tomar decisiones estratégicas', permissions: 'Acceso completo a todos los módulos · Anular ventas y órdenes · Configurar precios y límites de crédito · Ver todos los reportes' },
      { role: 'Contador', responsibilities: 'Gestionar facturación electrónica, conciliar cuentas por cobrar y pagar, exportar reportes fiscales', permissions: 'Facturación electrónica · Cuentas por cobrar y pagar · Reportes financieros · Solo lectura en ventas e inventario' },
    ],
    processFlows: {
      venta: {
        name: 'Ciclo de venta en mostrador',
        entity: 'Venta',
        states: ['Borrador', 'En proceso', 'Completada', 'Anulada', 'Devuelta'],
        transitions: [
          { from: 'Borrador',    to: 'En proceso',  actor: 'Vendedor',  action: 'Agregar productos al carrito' },
          { from: 'En proceso',  to: 'Completada',  actor: 'Vendedor',  action: 'Confirmar pago (efectivo, tarjeta, transferencia)' },
          { from: 'En proceso',  to: 'Anulada',     actor: 'Gerente',   action: 'Anular venta antes de confirmar' },
          { from: 'Completada',  to: 'Devuelta',    actor: 'Gerente',   action: 'Registrar devolución total o parcial' },
        ],
        businessRules: [
          'No se puede completar una venta si hay productos sin stock suficiente',
          'Solo el Gerente puede anular una venta ya completada',
          'Toda venta completada debe generar un documento fiscal (factura o recibo)',
          'Las devoluciones deben reintegrar el stock automáticamente',
          'Los descuentos mayores al 20% requieren aprobación del Gerente',
        ]
      },
      compra: {
        name: 'Ciclo de compra a proveedor',
        entity: 'Orden de compra',
        states: ['Borrador', 'Enviada', 'Parcialmente recibida', 'Recibida', 'Cancelada'],
        transitions: [
          { from: 'Borrador',               to: 'Enviada',                actor: 'Jefe de bodega', action: 'Enviar orden al proveedor' },
          { from: 'Enviada',                to: 'Parcialmente recibida',  actor: 'Jefe de bodega', action: 'Registrar recepción parcial' },
          { from: 'Parcialmente recibida',  to: 'Recibida',               actor: 'Jefe de bodega', action: 'Confirmar recepción total' },
          { from: 'Enviada',                to: 'Cancelada',              actor: 'Gerente',        action: 'Cancelar orden' },
        ],
        businessRules: [
          'Una orden recibida actualiza el inventario automáticamente',
          'Solo el Gerente puede cancelar una orden ya enviada',
          'El sistema debe alertar cuando el stock de un producto baje del mínimo configurado',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',    attrs: ['id', 'nombre', 'nit', 'direccion', 'telefono', 'email'] },
        { name: 'Usuario',    attrs: ['id', 'nombre', 'email', 'rol', 'activo', 'empresa_id'] },
        { name: 'Cliente',    attrs: ['id', 'nombre', 'documento', 'telefono', 'email', 'direccion', 'limite_credito', 'empresa_id'] },
        { name: 'Producto',   attrs: ['id', 'codigo', 'nombre', 'descripcion', 'precio_venta', 'precio_costo', 'stock', 'stock_minimo', 'categoria_id', 'empresa_id'] },
        { name: 'Categoria',  attrs: ['id', 'nombre', 'empresa_id'] },
        { name: 'Venta',      attrs: ['id', 'numero', 'fecha', 'cliente_id', 'usuario_id', 'subtotal', 'descuento', 'impuesto', 'total', 'estado', 'tipo_pago', 'empresa_id'] },
        { name: 'VentaItem',  attrs: ['id', 'venta_id', 'producto_id', 'cantidad', 'precio_unitario', 'descuento', 'subtotal'] },
        { name: 'Factura',    attrs: ['id', 'numero_fiscal', 'venta_id', 'fecha_emision', 'estado_sat', 'xml_url', 'pdf_url'] },
        { name: 'Proveedor',  attrs: ['id', 'nombre', 'nit', 'contacto', 'telefono', 'email', 'empresa_id'] },
        { name: 'Compra',     attrs: ['id', 'numero', 'fecha', 'proveedor_id', 'usuario_id', 'total', 'estado', 'empresa_id'] },
        { name: 'CompraItem', attrs: ['id', 'compra_id', 'producto_id', 'cantidad', 'precio_unitario', 'subtotal'] },
      ],
      relations: [
        'Empresa ||--o{ Usuario : "tiene"',
        'Empresa ||--o{ Cliente : "tiene"',
        'Empresa ||--o{ Producto : "tiene"',
        'Empresa ||--o{ Venta : "genera"',
        'Empresa ||--o{ Proveedor : "tiene"',
        'Cliente ||--o{ Venta : "realiza"',
        'Venta ||--|{ VentaItem : "contiene"',
        'Venta ||--o| Factura : "genera"',
        'Producto ||--o{ VentaItem : "aparece en"',
        'Proveedor ||--o{ Compra : "recibe"',
        'Compra ||--|{ CompraItem : "contiene"',
        'Producto ||--o{ CompraItem : "aparece en"',
        'Categoria ||--o{ Producto : "agrupa"',
        'Usuario ||--o{ Venta : "registra"',
      ]
    },
    glossary: [
      { term: 'Stock', def: 'Cantidad disponible de un producto en bodega o punto de venta' },
      { term: 'Stock mínimo', def: 'Cantidad mínima antes de la cual el sistema genera una alerta de reabastecimiento' },
      { term: 'NIT / RTU', def: 'Número de identificación tributaria del cliente o proveedor' },
      { term: 'Nota de crédito', def: 'Documento que anula o reduce el valor de una factura emitida' },
      { term: 'Cuenta por cobrar', def: 'Deuda pendiente de un cliente que compró a crédito' },
      { term: 'Cuenta por pagar', def: 'Deuda pendiente con un proveedor por mercancía recibida' },
      { term: 'Lista de precios', def: 'Precio diferenciado por tipo de cliente o volumen de compra' },
      { term: 'Costo promedio', def: 'Precio de costo promedio de un producto según sus compras históricas' },
    ],
    userStories: [
      { role: 'Vendedor', action: 'registrar una venta buscando productos por código o nombre', value: 'completar el despacho en menos de 2 minutos sin errores de precio' },
      { role: 'Jefe de bodega', action: 'recibir alertas automáticas cuando un producto baje del stock mínimo', value: 'hacer el pedido a tiempo y nunca quedarme sin mercancía' },
      { role: 'Gerente', action: 'ver el dashboard de ventas del día, semana y mes', value: 'tomar decisiones de compra y personal basadas en datos reales' },
      { role: 'Contador', action: 'exportar el reporte de ventas e impuestos del mes', value: 'preparar la declaración fiscal sin trabajo manual' },
      { role: 'Gerente', action: 'configurar límites de crédito por cliente', value: 'controlar el riesgo de cartera vencida' },
    ],
    screens: [
      { name: 'Dashboard principal', desc: 'Ventas del día (total, cantidad, ticket promedio), top 5 productos, alertas de stock bajo, cuentas por cobrar vencidas' },
      { name: 'Nueva venta (POS)', desc: 'Buscador de productos, carrito, selector de cliente, tipo de pago, botón de confirmar y opción de facturar' },
      { name: 'Inventario', desc: 'Lista de productos con stock actual, filtros por categoría, botón de ajuste manual, historial de movimientos' },
      { name: 'Clientes', desc: 'Listado con búsqueda, ficha de cliente con historial de compras y saldo de cuenta por cobrar' },
    ]
  },

  // ── TRANSPORTE Y LOGÍSTICA (H) ─────────────────────────────────────────────
  H: {
    mainEntity: 'Orden de transporte',
    roles: ['Despachador', 'Conductor', 'Gerente de operaciones', 'Contador'],
    roleDetails: [
      { role: 'Despachador', responsibilities: 'Crear y gestionar órdenes de transporte, asignar conductores y vehículos, generar manifiestos de carga y coordinar rutas del día', permissions: 'CRUD órdenes · Asignar conductor y vehículo · Generar manifiesto · Ver disponibilidad de flota · No puede cancelar órdenes asignadas' },
      { role: 'Conductor', responsibilities: 'Confirmar salida, registrar posición GPS, marcar entrega con firma o foto del destinatario y reportar incidentes en ruta', permissions: 'Ver sus órdenes asignadas · Confirmar salida y llegada · Registrar evidencia de entrega · Solo lectura en el resto del sistema' },
      { role: 'Gerente de operaciones', responsibilities: 'Monitorear flota en tiempo real, aprobar cotizaciones, cancelar órdenes, revisar KPIs y gestionar alertas de vencimientos legales', permissions: 'Acceso completo · Cancelar órdenes asignadas · Aprobar o rechazar cotizaciones · Ver reportes de todos los conductores y vehículos' },
      { role: 'Contador', responsibilities: 'Emitir facturas por órdenes entregadas, gestionar cuentas por cobrar de clientes y exportar reportes fiscales al SAT', permissions: 'Facturación electrónica · Cuentas por cobrar · Reportes financieros · Solo lectura en operaciones' },
    ],
    processFlows: {
      orden: {
        name: 'Ciclo de orden de transporte',
        entity: 'Orden',
        states: ['Solicitada', 'Cotizada', 'Aprobada', 'Asignada', 'En tránsito', 'Entregada', 'Facturada', 'Cancelada'],
        transitions: [
          { from: 'Solicitada',   to: 'Cotizada',     actor: 'Despachador',           action: 'Generar cotización de flete' },
          { from: 'Cotizada',     to: 'Aprobada',     actor: 'Cliente / Gerente',     action: 'Aprobar cotización' },
          { from: 'Aprobada',     to: 'Asignada',     actor: 'Despachador',           action: 'Asignar vehículo y conductor' },
          { from: 'Asignada',     to: 'En tránsito',  actor: 'Conductor',             action: 'Confirmar salida con GPS activo' },
          { from: 'En tránsito',  to: 'Entregada',    actor: 'Conductor',             action: 'Registrar entrega con firma o foto' },
          { from: 'Entregada',    to: 'Facturada',    actor: 'Contador',              action: 'Emitir factura al cliente' },
          { from: 'Aprobada',     to: 'Cancelada',    actor: 'Gerente',               action: 'Cancelar orden antes de asignar' },
        ],
        businessRules: [
          'Un conductor no puede tener dos órdenes en estado "En tránsito" simultáneamente',
          'Un vehículo no puede ser asignado si está en mantenimiento activo',
          'La licencia del conductor debe estar vigente para poder ser asignado',
          'El SOAT y la revisión técnica del vehículo deben estar vigentes',
          'Solo el Gerente puede cancelar una orden ya asignada',
          'Toda orden entregada debe generar automáticamente el aviso de facturación',
          'El manifiesto de carga debe generarse antes de que el conductor salga',
        ]
      },
      mantenimiento: {
        name: 'Ciclo de mantenimiento de vehículo',
        entity: 'Orden de mantenimiento',
        states: ['Programado', 'En taller', 'Terminado', 'Cancelado'],
        transitions: [
          { from: 'Programado',  to: 'En taller',  actor: 'Jefe de flota',  action: 'Ingresar vehículo al taller' },
          { from: 'En taller',   to: 'Terminado',  actor: 'Jefe de flota',  action: 'Registrar trabajos realizados y costo' },
          { from: 'Programado',  to: 'Cancelado',  actor: 'Gerente',        action: 'Cancelar mantenimiento programado' },
        ],
        businessRules: [
          'Un vehículo en mantenimiento no puede ser asignado a ninguna orden',
          'El sistema debe alertar 7 días antes del mantenimiento preventivo programado',
          'Cada mantenimiento debe registrar los repuestos usados y su costo',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',       attrs: ['id', 'nombre', 'nit', 'direccion', 'telefono'] },
        { name: 'Usuario',       attrs: ['id', 'nombre', 'email', 'rol', 'activo', 'empresa_id'] },
        { name: 'Cliente',       attrs: ['id', 'nombre', 'nit', 'contacto', 'telefono', 'email', 'direccion', 'empresa_id'] },
        { name: 'Conductor',     attrs: ['id', 'nombre', 'dpi', 'telefono', 'num_licencia', 'categoria_licencia', 'vencimiento_licencia', 'activo', 'empresa_id'] },
        { name: 'Vehiculo',      attrs: ['id', 'placa', 'marca', 'modelo', 'anio', 'tipo', 'capacidad_kg', 'estado', 'vencimiento_soat', 'vencimiento_revision', 'empresa_id'] },
        { name: 'Orden',         attrs: ['id', 'numero', 'fecha', 'cliente_id', 'origen', 'destino', 'descripcion_carga', 'peso_kg', 'valor_declarado', 'flete', 'estado', 'empresa_id'] },
        { name: 'Viaje',         attrs: ['id', 'orden_id', 'vehiculo_id', 'conductor_id', 'fecha_salida', 'fecha_llegada', 'km_inicio', 'km_fin', 'observaciones'] },
        { name: 'Manifiesto',    attrs: ['id', 'viaje_id', 'numero', 'fecha_emision', 'pdf_url'] },
        { name: 'Mantenimiento', attrs: ['id', 'vehiculo_id', 'tipo', 'fecha_programada', 'fecha_realizada', 'descripcion', 'costo', 'estado', 'empresa_id'] },
        { name: 'Factura',       attrs: ['id', 'orden_id', 'numero_fiscal', 'fecha', 'total', 'estado', 'xml_url', 'pdf_url'] },
      ],
      relations: [
        'Empresa ||--o{ Usuario : "tiene"',
        'Empresa ||--o{ Cliente : "tiene"',
        'Empresa ||--o{ Conductor : "emplea"',
        'Empresa ||--o{ Vehiculo : "posee"',
        'Empresa ||--o{ Orden : "gestiona"',
        'Cliente ||--o{ Orden : "solicita"',
        'Orden ||--o| Viaje : "genera"',
        'Orden ||--o| Factura : "se factura en"',
        'Viaje }o--|| Vehiculo : "usa"',
        'Viaje }o--|| Conductor : "conduce"',
        'Viaje ||--o| Manifiesto : "tiene"',
        'Vehiculo ||--o{ Mantenimiento : "recibe"',
      ]
    },
    glossary: [
      { term: 'Flete', def: 'Tarifa cobrada por el servicio de transporte de una carga' },
      { term: 'Manifiesto de carga', def: 'Documento oficial que describe la carga, origen, destino y datos del conductor' },
      { term: 'SOAT', def: 'Seguro obligatorio de accidentes de tránsito del vehículo' },
      { term: 'Revisión técnica', def: 'Inspección periódica obligatoria del estado mecánico del vehículo' },
      { term: 'DPI', def: 'Documento personal de identificación del conductor (Guatemala)' },
      { term: 'Categoría de licencia', def: 'Tipo de vehículo habilitado para conducir (A, B, C, E, M)' },
      { term: 'Carga a granel', def: 'Mercancía transportada sin embalaje individual (arena, granos, líquidos)' },
      { term: 'Valor declarado', def: 'Valor asegurado de la mercancía declarado por el cliente' },
    ],
    userStories: [
      { role: 'Despachador', action: 'crear una orden de transporte con origen, destino y descripción de carga', value: 'tener todo registrado desde el primer contacto con el cliente y no perder información' },
      { role: 'Despachador', action: 'asignar conductor y vehículo a una orden aprobada verificando disponibilidad', value: 'evitar conflictos de agenda y asegurar que el vehículo cumpla los requisitos legales' },
      { role: 'Conductor', action: 'ver mis órdenes asignadas del día desde mi celular', value: 'saber exactamente a dónde ir y qué llevar sin necesidad de llamar a la oficina' },
      { role: 'Gerente de operaciones', action: 'ver en tiempo real dónde está cada vehículo en ruta', value: 'responder a los clientes con información exacta y detectar demoras a tiempo' },
      { role: 'Gerente de operaciones', action: 'recibir alertas cuando vence el SOAT, la revisión técnica o la licencia de un conductor', value: 'operar siempre dentro de la legalidad sin depender de recordatorios manuales' },
    ],
    screens: [
      { name: 'Dashboard operaciones', desc: 'Órdenes del día por estado (semáforo visual), vehículos en ruta con última posición, alertas de vencimientos (SOAT, licencias), órdenes pendientes de facturar' },
      { name: 'Nueva orden', desc: 'Cliente (buscador), origen, destino, descripción de carga, peso, valor declarado, cotización de flete, notas especiales' },
      { name: 'Asignación de viaje', desc: 'Selector de vehículo (muestra disponibles y capacidad), selector de conductor (muestra disponibles y vigencia de licencia), fecha y hora de salida, botón de generar manifiesto' },
      { name: 'Seguimiento de flota', desc: 'Mapa con posición de cada vehículo en ruta, última actualización, nombre del conductor y orden asignada' },
    ]
  },

  // ── MANUFACTURA (C) ────────────────────────────────────────────────────────
  C: {
    mainEntity: 'Orden de producción',
    roles: ['Operario', 'Jefe de producción', 'Jefe de calidad', 'Gerente', 'Vendedor'],
    roleDetails: [
      { role: 'Operario', responsibilities: 'Ejecutar órdenes de producción, registrar materiales consumidos y reportar avance o incidentes en línea', permissions: 'Ver sus órdenes asignadas · Registrar consumo de materiales · Reportar avance · No puede crear ni cerrar órdenes' },
      { role: 'Jefe de producción', responsibilities: 'Crear y planificar órdenes de producción, verificar disponibilidad de materiales y supervisar el avance de la línea', permissions: 'CRUD órdenes de producción · Ver inventario de materias primas · Enviar lotes a control de calidad · Programar producción' },
      { role: 'Jefe de calidad', responsibilities: 'Inspeccionar lotes terminados, aprobar o rechazar producción con evidencia y registrar no conformidades', permissions: 'Aprobar y rechazar lotes · Registrar inspecciones · Ver historial de calidad por producto · Solo lectura en producción y materiales' },
      { role: 'Gerente', responsibilities: 'Revisar KPIs de producción, costos, rendimientos y tomar decisiones de capacidad y compras', permissions: 'Acceso completo a todos los módulos · Ver reportes de costos y eficiencia · Aprobar compras de materiales' },
      { role: 'Vendedor', responsibilities: 'Consultar disponibilidad de producto terminado, registrar pedidos de clientes y coordinar fechas de entrega', permissions: 'Ver stock de producto terminado · Crear pedidos de cliente · Ver historial de entregas · No accede a producción interna' },
    ],
    processFlows: {
      produccion: {
        name: 'Ciclo de orden de producción',
        entity: 'Orden de producción',
        states: ['Borrador', 'Planificada', 'En producción', 'Control de calidad', 'Aprobada', 'Rechazada', 'Completada'],
        transitions: [
          { from: 'Borrador',           to: 'Planificada',        actor: 'Jefe de producción', action: 'Verificar materiales disponibles y programar' },
          { from: 'Planificada',        to: 'En producción',      actor: 'Operario',           action: 'Iniciar producción y registrar materiales usados' },
          { from: 'En producción',      to: 'Control de calidad', actor: 'Jefe de producción', action: 'Enviar lote a inspección de calidad' },
          { from: 'Control de calidad', to: 'Aprobada',           actor: 'Jefe de calidad',    action: 'Aprobar lote tras inspección' },
          { from: 'Control de calidad', to: 'Rechazada',          actor: 'Jefe de calidad',    action: 'Rechazar lote con observaciones' },
          { from: 'Aprobada',           to: 'Completada',         actor: 'Jefe de producción', action: 'Ingresar producto terminado al inventario' },
        ],
        businessRules: [
          'No se puede iniciar una orden si los materiales del BOM no están disponibles en bodega',
          'Todo lote rechazado debe registrar la causa del rechazo',
          'La orden completada actualiza automáticamente el inventario de producto terminado',
          'Los materiales consumidos se descuentan del inventario al iniciar producción',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',           attrs: ['id', 'nombre', 'nit'] },
        { name: 'Usuario',           attrs: ['id', 'nombre', 'email', 'rol', 'empresa_id'] },
        { name: 'Producto',          attrs: ['id', 'codigo', 'nombre', 'tipo', 'unidad', 'stock', 'stock_minimo', 'empresa_id'] },
        { name: 'BOM',               attrs: ['id', 'producto_id', 'nombre', 'version', 'activo'] },
        { name: 'BOMItem',           attrs: ['id', 'bom_id', 'material_id', 'cantidad', 'unidad'] },
        { name: 'OrdenProduccion',   attrs: ['id', 'numero', 'producto_id', 'bom_id', 'cantidad', 'fecha_inicio', 'fecha_fin', 'estado', 'empresa_id'] },
        { name: 'MovimientoStock',   attrs: ['id', 'producto_id', 'tipo', 'cantidad', 'referencia', 'fecha', 'usuario_id'] },
        { name: 'Proveedor',         attrs: ['id', 'nombre', 'nit', 'contacto', 'empresa_id'] },
        { name: 'Compra',            attrs: ['id', 'proveedor_id', 'fecha', 'total', 'estado', 'empresa_id'] },
        { name: 'CompraItem',        attrs: ['id', 'compra_id', 'producto_id', 'cantidad', 'precio_unitario'] },
        { name: 'Cliente',           attrs: ['id', 'nombre', 'nit', 'contacto', 'empresa_id'] },
        { name: 'Pedido',            attrs: ['id', 'cliente_id', 'fecha', 'total', 'estado', 'empresa_id'] },
        { name: 'PedidoItem',        attrs: ['id', 'pedido_id', 'producto_id', 'cantidad', 'precio_unitario'] },
      ],
      relations: [
        'Empresa ||--o{ Producto : "fabrica"',
        'Producto ||--o{ BOM : "tiene versiones de"',
        'BOM ||--|{ BOMItem : "contiene"',
        'BOMItem }o--|| Producto : "requiere"',
        'Producto ||--o{ OrdenProduccion : "se produce en"',
        'OrdenProduccion }o--|| BOM : "sigue"',
        'Producto ||--o{ MovimientoStock : "registra"',
        'Proveedor ||--o{ Compra : "suministra en"',
        'Compra ||--|{ CompraItem : "tiene"',
        'Cliente ||--o{ Pedido : "realiza"',
        'Pedido ||--|{ PedidoItem : "contiene"',
      ]
    },
    glossary: [
      { term: 'BOM', def: 'Bill of Materials — lista de materiales necesarios para producir una unidad de producto' },
      { term: 'Lote', def: 'Cantidad producida en una misma orden de producción, identificable para trazabilidad' },
      { term: 'Materia prima', def: 'Material base que se transforma en producto terminado' },
      { term: 'Merma', def: 'Material desperdiciado o perdido durante el proceso de producción' },
      { term: 'Lead time', def: 'Tiempo desde que se hace un pedido al proveedor hasta que llega la mercancía' },
      { term: 'No conformidad', def: 'Defecto o desviación detectada durante el control de calidad' },
    ],
    userStories: [
      { role: 'Jefe de producción', action: 'crear una orden de producción y verificar automáticamente si hay materiales disponibles', value: 'no tener que revisar el inventario manualmente y evitar paros por falta de material' },
      { role: 'Operario', action: 'registrar los materiales que consumo al iniciar una producción', value: 'mantener el inventario actualizado sin papeleo adicional' },
      { role: 'Jefe de calidad', action: 'registrar la inspección de un lote con fotos y observaciones', value: 'tener evidencia de cada control de calidad para auditorías' },
    ],
    screens: [
      { name: 'Dashboard producción', desc: 'Órdenes activas por estado, stock de materias primas con alertas, producto terminado disponible, órdenes atrasadas' },
      { name: 'Nueva orden de producción', desc: 'Producto a fabricar, cantidad, BOM a usar (versión), fecha programada, observaciones, botón de verificar materiales' },
    ]
  },

  // ── RESTAURANTES Y HOTELERÍA (I) ───────────────────────────────────────────
  I: {
    mainEntity: 'Comanda',
    roles: ['Mesero', 'Cajero', 'Cocinero', 'Administrador'],
    roleDetails: [
      { role: 'Mesero', responsibilities: 'Tomar pedidos por mesa desde el celular, enviar comandas a cocina, registrar modificaciones y entregar órdenes listas', permissions: 'Crear y modificar comandas abiertas · Ver estado de mesas · Solicitar cuenta · No puede cerrar ni anular sin supervisión' },
      { role: 'Cocinero', responsibilities: 'Ver comandas entrantes en display de cocina, actualizar estado de cada ítem y alertar cuando un plato está listo', permissions: 'Ver comandas asignadas a cocina · Marcar ítems como listos · Ver tiempos de espera · Solo lectura de menú e inventario' },
      { role: 'Cajero', responsibilities: 'Cerrar mesas, procesar pagos en efectivo o tarjeta, dividir cuentas y emitir factura o recibo al cliente', permissions: 'Cerrar comandas · Procesar pagos · Emitir facturas · Aplicar descuentos aprobados · Ver historial de ventas del día' },
      { role: 'Administrador', responsibilities: 'Gestionar menú y precios, configurar mesas, revisar ventas del día, anular comandas y administrar usuarios', permissions: 'Acceso completo · Anular comandas · Configurar menú y precios · Ver reportes de ventas y costos · Gestionar usuarios' },
    ],
    processFlows: {
      comanda: {
        name: 'Ciclo de atención en mesa',
        entity: 'Comanda',
        states: ['Abierta', 'En cocina', 'Lista', 'Entregada', 'Cerrada', 'Anulada'],
        transitions: [
          { from: 'Abierta',    to: 'En cocina',  actor: 'Mesero',        action: 'Enviar pedido a cocina' },
          { from: 'En cocina',  to: 'Lista',       actor: 'Cocinero',      action: 'Marcar pedido como listo' },
          { from: 'Lista',      to: 'Entregada',   actor: 'Mesero',        action: 'Confirmar entrega en mesa' },
          { from: 'Entregada',  to: 'Cerrada',     actor: 'Cajero',        action: 'Registrar pago y emitir cuenta' },
          { from: 'Abierta',    to: 'Anulada',     actor: 'Administrador', action: 'Anular comanda antes de enviar a cocina' },
        ],
        businessRules: [
          'No se pueden agregar ítems a una comanda que ya está en estado "En cocina" o posterior',
          'Solo el Administrador puede anular una comanda enviada a cocina',
          'El cierre de mesa debe generar factura o recibo automáticamente',
          'Los descuentos en cuenta requieren aprobación del Administrador',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',    attrs: ['id', 'nombre', 'nit'] },
        { name: 'Mesa',       attrs: ['id', 'numero', 'capacidad', 'estado', 'empresa_id'] },
        { name: 'Comanda',    attrs: ['id', 'mesa_id', 'mesero_id', 'fecha', 'estado', 'total', 'empresa_id'] },
        { name: 'ComandaItem',attrs: ['id', 'comanda_id', 'producto_id', 'cantidad', 'precio', 'notas', 'estado'] },
        { name: 'Producto',   attrs: ['id', 'nombre', 'categoria', 'precio', 'disponible', 'empresa_id'] },
        { name: 'Usuario',    attrs: ['id', 'nombre', 'rol', 'activo', 'empresa_id'] },
        { name: 'Pago',       attrs: ['id', 'comanda_id', 'tipo', 'monto', 'fecha'] },
      ],
      relations: [
        'Empresa ||--o{ Mesa : "tiene"',
        'Mesa ||--o{ Comanda : "genera"',
        'Comanda ||--|{ ComandaItem : "contiene"',
        'ComandaItem }o--|| Producto : "es"',
        'Comanda ||--o{ Pago : "se paga con"',
        'Usuario ||--o{ Comanda : "atiende"',
      ]
    },
    glossary: [
      { term: 'Comanda', def: 'Pedido de una mesa que agrupa todos los platos y bebidas solicitados' },
      { term: 'Cover', def: 'Cargo fijo por cubierto o por persona en algunos restaurantes' },
      { term: 'Mise en place', def: 'Preparación previa de ingredientes antes del servicio' },
      { term: '86', def: 'Término de cocina para indicar que un plato está agotado' },
      { term: 'Turno de mesa', def: 'Número de veces que una misma mesa es ocupada durante un servicio' },
    ],
    userStories: [
      { role: 'Mesero', action: 'tomar el pedido de una mesa desde mi celular y enviarlo directo a cocina', value: 'agilizar el servicio sin ir físicamente a la cocina y reducir errores de comunicación' },
      { role: 'Cocinero', action: 'ver en pantalla de cocina los pedidos en orden de llegada con el tiempo transcurrido', value: 'priorizar correctamente y no olvidar ningún pedido' },
      { role: 'Cajero', action: 'cerrar una mesa, dividir la cuenta y cobrar con distintos métodos de pago', value: 'agilizar el cierre sin errores y emitir el comprobante fiscal al instante' },
    ],
    screens: [
      { name: 'Mapa de mesas', desc: 'Vista visual del salón con mesas por color según estado (libre, ocupada, con cuenta pendiente), tiempo en mesa, número de comanda activa' },
      { name: 'Comanda activa', desc: 'Lista de ítems con cantidad, precio y notas, buscador de productos, botón enviar a cocina, agregar ítem, ver total parcial' },
    ]
  },

  // ── SERVICIOS PROFESIONALES (M) ────────────────────────────────────────────
  M: {
    mainEntity: 'Proyecto',
    roles: ['Consultor', 'Gerente de proyecto', 'Director', 'Administrativo'],
    roleDetails: [
      { role: 'Consultor', responsibilities: 'Ejecutar tareas del proyecto, registrar horas trabajadas diariamente y entregar productos según el alcance acordado', permissions: 'Ver proyectos asignados · Registrar horas · Actualizar estado de tareas · Subir entregables · No puede ver costos ni facturación' },
      { role: 'Gerente de proyecto', responsibilities: 'Planificar y supervisar el proyecto, asignar tareas al equipo, controlar presupuesto y horas, y gestionar la comunicación con el cliente', permissions: 'CRUD tareas y asignaciones · Ver horas de su equipo · Ver presupuesto vs. real · Aprobar horas · No puede facturar' },
      { role: 'Director', responsibilities: 'Aprobar propuestas comerciales, monitorear portafolio de proyectos, autorizar gastos fuera de presupuesto y cerrar proyectos', permissions: 'Acceso completo · Aprobar o rechazar propuestas · Ver todos los proyectos y sus finanzas · Cancelar proyectos' },
      { role: 'Administrativo', responsibilities: 'Emitir facturas por hitos completados, gestionar cuentas por cobrar y preparar reportes financieros del portafolio', permissions: 'Facturación · Cuentas por cobrar · Reportes financieros · Solo lectura en proyectos y tareas' },
    ],
    processFlows: {
      proyecto: {
        name: 'Ciclo de proyecto de consultoría',
        entity: 'Proyecto',
        states: ['Propuesta', 'Aprobado', 'En ejecución', 'En revisión', 'Entregado', 'Facturado', 'Cancelado'],
        transitions: [
          { from: 'Propuesta',    to: 'Aprobado',      actor: 'Cliente / Director',   action: 'Aprobar propuesta comercial' },
          { from: 'Aprobado',     to: 'En ejecución',  actor: 'Gerente de proyecto',  action: 'Iniciar ejecución y asignar equipo' },
          { from: 'En ejecución', to: 'En revisión',   actor: 'Gerente de proyecto',  action: 'Entregar al cliente para revisión' },
          { from: 'En revisión',  to: 'En ejecución',  actor: 'Consultor',            action: 'Incorporar correcciones del cliente' },
          { from: 'En revisión',  to: 'Entregado',     actor: 'Cliente',              action: 'Aprobar entrega final' },
          { from: 'Entregado',    to: 'Facturado',     actor: 'Administrativo',       action: 'Emitir factura de cierre' },
        ],
        businessRules: [
          'No se puede iniciar ejecución sin contrato firmado',
          'Las horas registradas por consultores deben ser aprobadas semanalmente',
          'El presupuesto del proyecto no puede sobrepasarse sin aprobación del Director',
          'Todo entregable debe estar aprobado antes de facturar el hito correspondiente',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',    attrs: ['id', 'nombre', 'nit'] },
        { name: 'Cliente',    attrs: ['id', 'nombre', 'nit', 'contacto', 'empresa_id'] },
        { name: 'Proyecto',   attrs: ['id', 'nombre', 'cliente_id', 'fecha_inicio', 'fecha_fin', 'presupuesto', 'estado', 'empresa_id'] },
        { name: 'Tarea',      attrs: ['id', 'proyecto_id', 'nombre', 'asignado_id', 'fecha_limite', 'estado', 'horas_estimadas'] },
        { name: 'Hora',       attrs: ['id', 'tarea_id', 'usuario_id', 'fecha', 'horas', 'descripcion', 'aprobada'] },
        { name: 'Usuario',    attrs: ['id', 'nombre', 'rol', 'tarifa_hora', 'empresa_id'] },
        { name: 'Factura',    attrs: ['id', 'proyecto_id', 'monto', 'fecha', 'estado', 'concepto'] },
      ],
      relations: [
        'Cliente ||--o{ Proyecto : "contrata"',
        'Proyecto ||--o{ Tarea : "tiene"',
        'Tarea ||--o{ Hora : "registra"',
        'Usuario ||--o{ Tarea : "ejecuta"',
        'Usuario ||--o{ Hora : "reporta"',
        'Proyecto ||--o{ Factura : "genera"',
      ]
    },
    glossary: [
      { term: 'Entregable', def: 'Producto o documento concreto que se entrega al cliente como parte del proyecto' },
      { term: 'Hito', def: 'Punto de control en el proyecto asociado generalmente a un pago parcial' },
      { term: 'Propuesta comercial', def: 'Documento que describe el alcance, tiempo y costo del proyecto para aprobación del cliente' },
      { term: 'Registro de horas', def: 'Tiempo trabajado por cada consultor en tareas específicas del proyecto' },
    ],
    userStories: [
      { role: 'Consultor', action: 'registrar las horas que trabajé hoy en cada tarea del proyecto', value: 'tener un registro preciso para facturar correctamente al cliente' },
      { role: 'Gerente de proyecto', action: 'ver el avance de todas las tareas y las horas consumidas vs estimadas', value: 'detectar desviaciones antes de que el proyecto se salga de presupuesto' },
    ],
    screens: [
      { name: 'Dashboard de proyectos', desc: 'Lista de proyectos activos, % de avance, horas consumidas vs presupuesto, hitos próximos a vencer' },
      { name: 'Registro de horas', desc: 'Seleccionar proyecto y tarea, ingresar horas y descripción de trabajo, fecha, botón guardar' },
    ]
  },

  // ── SALUD Y BIENESTAR (Q) ──────────────────────────────────────────────────
  Q: {
    mainEntity: 'Cita',
    roles: ['Recepcionista', 'Médico / Profesional', 'Paciente', 'Administrador'],
    roleDetails: [
      { role: 'Recepcionista', responsibilities: 'Agendar, confirmar y cancelar citas, registrar llegada del paciente y gestionar la sala de espera', permissions: 'CRUD citas · Registrar llegadas · Buscar pacientes · Ver agenda del día · No accede a historia clínica ni facturación' },
      { role: 'Médico / Profesional', responsibilities: 'Atender consultas, registrar notas de evolución en la historia clínica, emitir prescripciones y ordenar exámenes', permissions: 'Ver y editar historia clínica de sus pacientes · Emitir recetas · Solicitar exámenes · Ver su propia agenda · No accede a facturación' },
      { role: 'Administrador', responsibilities: 'Gestionar tarifas, revisar ingresos, procesar pagos y facturas, y administrar usuarios y configuración del sistema', permissions: 'Acceso completo · Configurar tarifas y convenios · Procesar pagos y facturación · Ver reportes financieros y de ocupación' },
    ],
    processFlows: {
      cita: {
        name: 'Ciclo de atención al paciente',
        entity: 'Cita',
        states: ['Agendada', 'Confirmada', 'En sala de espera', 'En consulta', 'Atendida', 'Cancelada', 'No asistió'],
        transitions: [
          { from: 'Agendada',          to: 'Confirmada',       actor: 'Recepcionista / Sistema', action: 'Confirmar cita por WhatsApp o llamada' },
          { from: 'Confirmada',        to: 'En sala de espera',actor: 'Recepcionista',           action: 'Registrar llegada del paciente' },
          { from: 'En sala de espera', to: 'En consulta',      actor: 'Médico',                  action: 'Llamar al paciente a consulta' },
          { from: 'En consulta',       to: 'Atendida',         actor: 'Médico',                  action: 'Cerrar consulta y guardar historia clínica' },
          { from: 'Confirmada',        to: 'Cancelada',        actor: 'Paciente / Recepcionista', action: 'Cancelar con al menos 2 horas de anticipación' },
          { from: 'Confirmada',        to: 'No asistió',       actor: 'Sistema',                  action: 'Marcar automáticamente si no llegó' },
        ],
        businessRules: [
          'Un médico no puede tener dos citas en el mismo horario',
          'Las cancelaciones con menos de 2 horas de anticipación pueden generar cargo por no presentación',
          'La historia clínica solo puede ser editada por el profesional que atendió la consulta',
          'Toda cita atendida debe generar al menos una nota de evolución en la historia clínica',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',        attrs: ['id', 'nombre', 'nit'] },
        { name: 'Paciente',       attrs: ['id', 'nombre', 'documento', 'fecha_nacimiento', 'telefono', 'email', 'empresa_id'] },
        { name: 'Profesional',    attrs: ['id', 'nombre', 'especialidad', 'registro_medico', 'empresa_id'] },
        { name: 'Cita',           attrs: ['id', 'paciente_id', 'profesional_id', 'fecha', 'hora', 'duracion_min', 'motivo', 'estado', 'empresa_id'] },
        { name: 'HistoriaClinica',attrs: ['id', 'paciente_id', 'fecha_apertura', 'empresa_id'] },
        { name: 'Consulta',       attrs: ['id', 'cita_id', 'historia_id', 'profesional_id', 'fecha', 'motivo', 'diagnostico', 'tratamiento', 'notas'] },
        { name: 'Factura',        attrs: ['id', 'cita_id', 'monto', 'tipo_pago', 'fecha', 'estado'] },
      ],
      relations: [
        'Paciente ||--o{ Cita : "agenda"',
        'Profesional ||--o{ Cita : "atiende"',
        'Cita ||--o| Consulta : "genera"',
        'Paciente ||--|| HistoriaClinica : "tiene"',
        'HistoriaClinica ||--o{ Consulta : "contiene"',
        'Cita ||--o| Factura : "se cobra en"',
      ]
    },
    glossary: [
      { term: 'Historia clínica', def: 'Registro acumulado de todas las consultas, diagnósticos y tratamientos de un paciente' },
      { term: 'SOAP', def: 'Formato de nota clínica: Subjetivo, Objetivo, Análisis, Plan' },
      { term: 'No show', def: 'Paciente que no se presentó a su cita sin cancelar previamente' },
      { term: 'Tiempo de espera', def: 'Tiempo entre la llegada del paciente y el inicio de la consulta' },
    ],
    userStories: [
      { role: 'Recepcionista', action: 'agendar una cita buscando la disponibilidad del profesional en un calendario', value: 'confirmar el horario al paciente en segundos sin cruzar citas' },
      { role: 'Médico', action: 'ver el historial completo del paciente antes de iniciar la consulta', value: 'dar una atención más precisa sin repetir preguntas que ya respondió antes' },
    ],
    screens: [
      { name: 'Agenda del día', desc: 'Vista de calendario con citas por hora y profesional, estado de cada cita por color, botón de registrar llegada' },
      { name: 'Historia clínica del paciente', desc: 'Datos del paciente, lista de consultas anteriores en orden cronológico, botón de nueva consulta' },
    ]
  },

  // ── EDUCACIÓN (P) ──────────────────────────────────────────────────────────
  P: {
    mainEntity: 'Matrícula',
    roles: ['Secretaria académica', 'Docente', 'Coordinador', 'Padre de familia'],
    roleDetails: [
      { role: 'Secretaria académica', responsibilities: 'Registrar matrículas, gestionar documentos de estudiantes, controlar pagos de mensualidades y emitir constancias', permissions: 'CRUD matrículas y estudiantes · Registrar pagos · Emitir constancias · Ver notas en modo lectura · No puede modificar calificaciones' },
      { role: 'Docente', responsibilities: 'Ingresar notas por bimestre, registrar asistencia y enviar comunicados a padres de familia de su sección', permissions: 'Ingresar y editar notas de sus cursos · Registrar asistencia · Enviar comunicados · Ver lista de sus estudiantes' },
      { role: 'Coordinador', responsibilities: 'Supervisar rendimiento académico, aprobar retiros y traslados, revisar estadísticas de asistencia y promover estudiantes', permissions: 'Acceso completo al módulo académico · Aprobar retiros y cambios · Ver estadísticas de todos los grados · Configurar períodos y ponderaciones' },
      { role: 'Padre de familia', responsibilities: 'Consultar notas, asistencia y comunicados de su hijo, y ver el estado de pagos pendientes', permissions: 'Solo lectura: notas, asistencia y comunicados de sus hijos · Ver sus facturas y saldo pendiente · Sin acceso a datos de otros estudiantes' },
    ],
    processFlows: {
      matricula: {
        name: 'Ciclo de matrícula',
        entity: 'Matrícula',
        states: ['Pre-inscrita', 'Documentos pendientes', 'Activa', 'Retirada', 'Graduada'],
        transitions: [
          { from: 'Pre-inscrita',         to: 'Documentos pendientes', actor: 'Secretaria',  action: 'Registrar al estudiante y listar documentos requeridos' },
          { from: 'Documentos pendientes',to: 'Activa',                actor: 'Secretaria',  action: 'Confirmar documentos y activar matrícula' },
          { from: 'Activa',               to: 'Retirada',              actor: 'Coordinador', action: 'Registrar retiro con motivo' },
          { from: 'Activa',               to: 'Graduada',              actor: 'Coordinador', action: 'Confirmar egreso tras completar requisitos' },
        ],
        businessRules: [
          'No se puede activar una matrícula sin los documentos obligatorios completos',
          'Un estudiante retirado no puede ser rematricula en el mismo período',
          'Las notas solo pueden ser ingresadas por el docente del curso',
          'El promedio final se calcula automáticamente según las ponderaciones configuradas',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',    attrs: ['id', 'nombre', 'codigo_mined'] },
        { name: 'Estudiante', attrs: ['id', 'nombre', 'documento', 'fecha_nacimiento', 'telefono', 'email_padre', 'empresa_id'] },
        { name: 'Grado',      attrs: ['id', 'nombre', 'nivel', 'empresa_id'] },
        { name: 'Seccion',    attrs: ['id', 'grado_id', 'nombre', 'cupo_max', 'docente_id'] },
        { name: 'Matricula',  attrs: ['id', 'estudiante_id', 'seccion_id', 'periodo', 'fecha', 'estado', 'empresa_id'] },
        { name: 'Curso',      attrs: ['id', 'nombre', 'grado_id', 'docente_id', 'horas_semana'] },
        { name: 'Nota',       attrs: ['id', 'matricula_id', 'curso_id', 'bimestre', 'valor', 'fecha'] },
        { name: 'Usuario',    attrs: ['id', 'nombre', 'rol', 'empresa_id'] },
        { name: 'Pago',       attrs: ['id', 'matricula_id', 'concepto', 'monto', 'fecha', 'estado'] },
      ],
      relations: [
        'Estudiante ||--o{ Matricula : "tiene"',
        'Seccion ||--o{ Matricula : "agrupa"',
        'Grado ||--o{ Seccion : "divide en"',
        'Grado ||--o{ Curso : "tiene"',
        'Matricula ||--o{ Nota : "obtiene"',
        'Curso ||--o{ Nota : "genera"',
        'Matricula ||--o{ Pago : "genera"',
        'Usuario ||--o{ Curso : "imparte"',
      ]
    },
    glossary: [
      { term: 'Período académico', def: 'Año o semestre escolar para el que aplica la matrícula' },
      { term: 'Bimestre', def: 'Período de evaluación de aproximadamente dos meses' },
      { term: 'Ponderación', def: 'Peso porcentual de cada componente de evaluación en la nota final' },
      { term: 'MINEDUC', def: 'Ministerio de Educación — entidad que regula la educación formal' },
    ],
    userStories: [
      { role: 'Secretaria académica', action: 'registrar la matrícula de un estudiante nuevo con todos sus datos', value: 'tener el expediente completo desde el primer día sin usar papel' },
      { role: 'Docente', action: 'ingresar las notas de mis estudiantes por bimestre', value: 'que el sistema calcule automáticamente el promedio y genere el boletín' },
    ],
    screens: [
      { name: 'Lista de estudiantes', desc: 'Tabla con búsqueda, filtro por grado y estado de matrícula, acceso rápido a ficha del estudiante' },
      { name: 'Ingreso de notas', desc: 'Selector de curso y bimestre, tabla de estudiantes con campo de nota por cada uno, botón guardar y calcular promedio' },
    ]
  },

  // ── CONSTRUCCIÓN (F) ───────────────────────────────────────────────────────
  F: {
    mainEntity: 'Proyecto de obra',
    roles: ['Maestro de obras', 'Residente de obra', 'Director de proyectos', 'Contador'],
    roleDetails: [
      { role: 'Maestro de obras', responsibilities: 'Registrar avance diario por actividad, reportar consumo de materiales y mano de obra, y subir evidencias fotográficas', permissions: 'Ver actividades de su frente · Registrar avance y consumos · Subir fotos · No puede modificar presupuesto ni aprobar pagos' },
      { role: 'Residente de obra', responsibilities: 'Supervisar avance global, validar reportes del maestro, solicitar compras de materiales y preparar actas de avance', permissions: 'CRUD actividades y avances · Solicitar compras · Preparar actas · Ver presupuesto vs. real · No puede aprobar pagos a subcontratistas' },
      { role: 'Director de proyectos', responsibilities: 'Aprobar actas de avance y pagos, monitorear portafolio de obras, autorizar adiciones de contrato y revisar KPIs financieros', permissions: 'Acceso completo · Aprobar actas y pagos · Autorizar adiciones · Ver todos los proyectos y sus finanzas' },
      { role: 'Contador', responsibilities: 'Emitir facturas por actas aprobadas, gestionar pagos a proveedores y subcontratistas, y preparar reportes fiscales', permissions: 'Facturación · Pagos a proveedores · Reportes financieros · Solo lectura en avance de obra' },
    ],
    processFlows: {
      obra: {
        name: 'Ciclo de proyecto de construcción',
        entity: 'Proyecto',
        states: ['Formulación', 'Licitación', 'Contratado', 'En ejecución', 'Suspendido', 'Liquidado'],
        transitions: [
          { from: 'Formulación',   to: 'Licitación',    actor: 'Director',          action: 'Publicar invitación a oferentes' },
          { from: 'Licitación',    to: 'Contratado',    actor: 'Director',          action: 'Adjudicar y firmar contrato' },
          { from: 'Contratado',    to: 'En ejecución',  actor: 'Residente de obra', action: 'Iniciar trabajos con acta de inicio' },
          { from: 'En ejecución',  to: 'Suspendido',    actor: 'Director',          action: 'Emitir orden de suspensión' },
          { from: 'En ejecución',  to: 'Liquidado',     actor: 'Director',          action: 'Firmar acta de liquidación final' },
        ],
        businessRules: [
          'No se puede iniciar obra sin acta de inicio firmada',
          'Las actas de avance deben ser aprobadas antes de liberar pagos parciales',
          'Cualquier trabajo adicional debe registrarse como ítem extra con aprobación escrita',
          'El presupuesto no puede modificarse sin una adición o disminución de contrato aprobada',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',    attrs: ['id', 'nombre', 'nit'] },
        { name: 'Cliente',    attrs: ['id', 'nombre', 'nit', 'contacto', 'empresa_id'] },
        { name: 'Proyecto',   attrs: ['id', 'nombre', 'cliente_id', 'ubicacion', 'fecha_inicio', 'fecha_fin', 'presupuesto', 'estado', 'empresa_id'] },
        { name: 'Capitulo',   attrs: ['id', 'proyecto_id', 'nombre', 'orden'] },
        { name: 'APU',        attrs: ['id', 'capitulo_id', 'descripcion', 'unidad', 'cantidad', 'precio_unitario', 'total'] },
        { name: 'ActaAvance', attrs: ['id', 'proyecto_id', 'numero', 'fecha', 'porcentaje', 'valor', 'estado'] },
        { name: 'Compra',     attrs: ['id', 'proyecto_id', 'proveedor_id', 'fecha', 'total', 'estado'] },
        { name: 'Proveedor',  attrs: ['id', 'nombre', 'nit', 'especialidad', 'empresa_id'] },
      ],
      relations: [
        'Cliente ||--o{ Proyecto : "contrata"',
        'Proyecto ||--o{ Capitulo : "divide en"',
        'Capitulo ||--|{ APU : "tiene"',
        'Proyecto ||--o{ ActaAvance : "reporta"',
        'Proyecto ||--o{ Compra : "genera"',
        'Proveedor ||--o{ Compra : "suministra en"',
      ]
    },
    glossary: [
      { term: 'APU', def: 'Análisis de Precios Unitarios — desglose detallado del costo de cada ítem de obra' },
      { term: 'Acta de avance', def: 'Documento que certifica el porcentaje de obra ejecutado para gestionar pagos parciales' },
      { term: 'Adición de contrato', def: 'Aumento formal del valor del contrato por trabajos adicionales aprobados' },
      { term: 'Ítem extra', def: 'Trabajo no contemplado en el contrato original, requiere aprobación escrita' },
    ],
    userStories: [
      { role: 'Residente de obra', action: 'registrar el avance diario de actividades con fotos', value: 'tener evidencia de lo construido y soportar las actas de cobro' },
      { role: 'Director de proyectos', action: 'comparar el costo presupuestado vs el costo real de cada ítem', value: 'detectar desviaciones antes de que el proyecto pierda dinero' },
    ],
    screens: [
      { name: 'Dashboard de obra', desc: 'Avance físico y financiero del proyecto, comparativo presupuesto vs gasto real, tareas de la semana, alertas de vencimiento de plazo' },
    ]
  },

  // ── AGRICULTURA (A) ────────────────────────────────────────────────────────
  A: {
    mainEntity: 'Lote de cultivo',
    roles: ['Agricultor / Operario', 'Mayordomo', 'Administrador'],
    roleDetails: [
      { role: 'Agricultor / Operario', responsibilities: 'Registrar labores del día (aplicaciones, jornales, cosecha) en el lote asignado usando el celular desde el campo', permissions: 'Registrar aplicaciones y jornales en sus lotes · Ver instrucciones de trabajo · No puede ver costos ni reportes financieros' },
      { role: 'Mayordomo', responsibilities: 'Supervisar operaciones diarias, asignar personal a lotes, aprobar aplicaciones de agroquímicos y registrar cosechas', permissions: 'CRUD actividades en todos los lotes · Ver inventario de insumos · Registrar cosechas · Ver reportes operativos' },
      { role: 'Administrador', responsibilities: 'Gestionar compras de insumos, revisar costos por lote, exportar reportes de rentabilidad y cumplimiento BPA', permissions: 'Acceso completo · Ver costos y rentabilidad · Gestionar compras · Configurar trazabilidad BPA · Exportar reportes' },
    ],
    processFlows: {
      cultivo: {
        name: 'Ciclo de cultivo',
        entity: 'Ciclo de cultivo',
        states: ['Preparación de suelo', 'Siembra', 'Desarrollo', 'Cosecha', 'Post-cosecha', 'Cerrado'],
        transitions: [
          { from: 'Preparación de suelo', to: 'Siembra',        actor: 'Mayordomo',   action: 'Confirmar preparación y registrar siembra' },
          { from: 'Siembra',             to: 'Desarrollo',      actor: 'Sistema',     action: 'Avanzar automáticamente al registrar primera aplicación' },
          { from: 'Desarrollo',          to: 'Cosecha',         actor: 'Mayordomo',   action: 'Registrar inicio de cosecha' },
          { from: 'Cosecha',             to: 'Post-cosecha',    actor: 'Mayordomo',   action: 'Registrar producción total obtenida' },
          { from: 'Post-cosecha',        to: 'Cerrado',         actor: 'Administrador',action: 'Cerrar ciclo con resumen de costos y producción' },
        ],
        businessRules: [
          'Cada aplicación de agroquímico debe registrar producto, dosis y operario',
          'El inventario de agroquímicos se descuenta al registrar cada aplicación',
          'Los costos de mano de obra se registran por jornal y lote trabajado',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',       attrs: ['id', 'nombre', 'nit'] },
        { name: 'Finca',         attrs: ['id', 'nombre', 'area_ha', 'ubicacion', 'empresa_id'] },
        { name: 'Lote',          attrs: ['id', 'finca_id', 'nombre', 'area_ha', 'cultivo_actual'] },
        { name: 'CicloCultivo',  attrs: ['id', 'lote_id', 'cultivo', 'variedad', 'fecha_inicio', 'fecha_fin', 'estado', 'empresa_id'] },
        { name: 'Aplicacion',    attrs: ['id', 'ciclo_id', 'producto_id', 'fecha', 'dosis', 'unidad', 'operario_id', 'costo'] },
        { name: 'Cosecha',       attrs: ['id', 'ciclo_id', 'fecha', 'cantidad_kg', 'precio_kg', 'destino'] },
        { name: 'Producto',      attrs: ['id', 'nombre', 'tipo', 'unidad', 'stock', 'empresa_id'] },
        { name: 'Usuario',       attrs: ['id', 'nombre', 'rol', 'empresa_id'] },
        { name: 'Jornal',        attrs: ['id', 'ciclo_id', 'usuario_id', 'fecha', 'horas', 'valor'] },
      ],
      relations: [
        'Finca ||--o{ Lote : "tiene"',
        'Lote ||--o{ CicloCultivo : "tiene"',
        'CicloCultivo ||--o{ Aplicacion : "registra"',
        'CicloCultivo ||--o{ Cosecha : "produce"',
        'CicloCultivo ||--o{ Jornal : "genera"',
        'Aplicacion }o--|| Producto : "usa"',
        'Aplicacion }o--|| Usuario : "realiza"',
      ]
    },
    glossary: [
      { term: 'Lote', def: 'División de la finca con cultivo específico' },
      { term: 'Jornal', def: 'Día de trabajo de un operario agrícola' },
      { term: 'BPA', def: 'Buenas Prácticas Agrícolas — estándar de calidad e inocuidad' },
      { term: 'Agroquímico', def: 'Producto químico usado en el cultivo (fertilizante, pesticida, fungicida)' },
    ],
    userStories: [
      { role: 'Mayordomo', action: 'registrar una aplicación de agroquímico en un lote', value: 'cumplir con los registros de trazabilidad y controlar el gasto en insumos' },
    ],
    screens: [
      { name: 'Mapa de finca', desc: 'Vista de los lotes con su cultivo actual y estado del ciclo, al hacer clic muestra detalle del lote' },
    ]
  },

  // ── OTROS SERVICIOS (N, R, S) — fallback genérico ─────────────────────────
  DEFAULT: {
    mainEntity: 'Servicio / Orden',
    roles: ['Operador', 'Supervisor', 'Gerente', 'Contador'],
    roleDetails: [
      { role: 'Operador', responsibilities: 'Ejecutar órdenes de servicio asignadas, registrar avance y evidencia de finalización, y reportar incidencias', permissions: 'Ver sus órdenes asignadas · Actualizar estado · Registrar evidencia · No puede facturar ni cancelar órdenes' },
      { role: 'Supervisor', responsibilities: 'Asignar órdenes al equipo, verificar calidad del servicio prestado y gestionar la agenda de trabajo', permissions: 'CRUD órdenes · Asignar operadores · Ver estado de todas las órdenes · Aprobar finalización · No puede facturar' },
      { role: 'Gerente', responsibilities: 'Revisar KPIs operativos, atender escalaciones de clientes, aprobar descuentos y supervisar el desempeño del equipo', permissions: 'Acceso completo · Ver reportes de productividad · Aprobar descuentos · Cancelar órdenes · Configurar el sistema' },
      { role: 'Contador', responsibilities: 'Facturar servicios completados, gestionar cuentas por cobrar y preparar reportes financieros periódicos', permissions: 'Facturación · Cuentas por cobrar · Reportes financieros · Solo lectura en órdenes y operaciones' },
    ],
    processFlows: {
      servicio: {
        name: 'Ciclo de prestación de servicio',
        entity: 'Orden de servicio',
        states: ['Solicitada', 'Asignada', 'En ejecución', 'Completada', 'Facturada', 'Cancelada'],
        transitions: [
          { from: 'Solicitada',   to: 'Asignada',     actor: 'Supervisor', action: 'Asignar a operador disponible' },
          { from: 'Asignada',     to: 'En ejecución', actor: 'Operador',   action: 'Iniciar el servicio' },
          { from: 'En ejecución', to: 'Completada',   actor: 'Operador',   action: 'Registrar finalización con evidencia' },
          { from: 'Completada',   to: 'Facturada',    actor: 'Contador',   action: 'Emitir factura al cliente' },
          { from: 'Asignada',     to: 'Cancelada',    actor: 'Gerente',    action: 'Cancelar por solicitud del cliente' },
        ],
        businessRules: [
          'Un operador no puede tener más de 3 órdenes activas simultáneamente',
          'Toda orden completada requiere evidencia (foto o firma del cliente)',
          'No se puede facturar sin que el cliente confirme la finalización',
        ]
      }
    },
    erd: {
      entities: [
        { name: 'Empresa',        attrs: ['id', 'nombre', 'nit'] },
        { name: 'Cliente',        attrs: ['id', 'nombre', 'documento', 'telefono', 'email', 'empresa_id'] },
        { name: 'Usuario',        attrs: ['id', 'nombre', 'rol', 'activo', 'empresa_id'] },
        { name: 'OrdenServicio',  attrs: ['id', 'numero', 'cliente_id', 'descripcion', 'fecha', 'estado', 'total', 'empresa_id'] },
        { name: 'Factura',        attrs: ['id', 'orden_id', 'numero_fiscal', 'fecha', 'total', 'estado'] },
      ],
      relations: [
        'Empresa ||--o{ Cliente : "tiene"',
        'Empresa ||--o{ Usuario : "emplea"',
        'Cliente ||--o{ OrdenServicio : "solicita"',
        'OrdenServicio ||--o| Factura : "genera"',
        'Usuario ||--o{ OrdenServicio : "ejecuta"',
      ]
    },
    glossary: [
      { term: 'Orden de servicio', def: 'Solicitud formal de un servicio con descripción, cliente y estado de ejecución' },
      { term: 'SLA', def: 'Service Level Agreement — tiempo máximo acordado para completar un servicio' },
    ],
    userStories: [
      { role: 'Operador', action: 'ver mis órdenes asignadas del día', value: 'organizar mi trabajo sin necesidad de preguntar al supervisor' },
      { role: 'Gerente', action: 'ver el estado de todas las órdenes activas en tiempo real', value: 'responder a los clientes con información exacta' },
    ],
    screens: [
      { name: 'Lista de órdenes', desc: 'Tabla con filtros por estado, cliente y fecha, indicador visual del estado por color' },
    ]
  }
}

export function getDomainKnowledge(isic) {
  return DOMAIN_KNOWLEDGE[isic] || DOMAIN_KNOWLEDGE.DEFAULT
}
