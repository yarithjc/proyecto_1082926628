# PROMPTS DE IMPLEMENTACIÓN — StockControl
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_STOCKCONTROL.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_STOCKCONTROL.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_STOCKCONTROL.md
2. Leer doc/ESTADO_EJECUCION_STOCKCONTROL.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_STOCKCONTROL.md y crear el archivo
doc/ESTADO_EJECUCION_STOCKCONTROL.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de la primera experiencia visual del usuario en aplicaciones de
gestión comercial.

Tu mentalidad: StockControl es una herramienta de trabajo del día a día
en una salsamentaría. El cajero la usa decenas de veces al día para registrar
ventas. El propietario la abre en la mañana para revisar qué se vendió ayer.
La arquitectura tiene que ser sólida, sin caché que muestre datos viejos y
con una identidad visual que transmita el ambiente del negocio.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_STOCKCONTROL.md — secciones 8 (stack y variables de entorno),
   9 (reglas de oro — especialmente la regla 6 sobre registerSale como
   operación secuencial en el servidor y la regla 7 sobre snapshot de precio),
   10 (estructura del seed.json con admin y los 3 productos de demo),
   13 (blobAudit con getBlobToken lazy y withFileLock) y 17 (identidad visual
   del login — fondo rojo oscuro, tarjeta blanca, logo de cuchillo)
2. doc/ESTADO_EJECUCION_STOCKCONTROL.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— StockControl NO tiene registro público. El formulario de login no tiene
  link de "Crear cuenta". Los usuarios los crea únicamente el administrador
  desde el panel. Esta es una diferencia importante respecto a FlowMind
  o CampusZen — aquí el registro autoservicio no existe.

— El seed.json incluye tanto el admin como los 3 productos de demo
  (Salchichón, Queso Costeño, Mortadela). El seedReader debe exponer ambos.
  En modo seed, el sistema puede mostrar el inventario de demo al admin
  para que tenga contexto antes del bootstrap.

— El token de Blob se accede siempre con getBlobToken() como función lazy,
  nunca como constante de módulo.

— La auditoría usa get() del SDK de @vercel/blob, nunca fetch(url).
  Los blobs privados devuelven 401 silencioso con fetch.

— withFileLock serializa escrituras al mismo archivo de auditoría.
  En una salsamentaría activa puede haber varias ventas simultáneas.

— dataService.ts es el ÚNICO archivo que importa supabase.ts y blobAudit.ts.

— La identidad visual del login no es opcional: fondo rojo oscuro #7F1D1D
  con patrón geométrico sutil, tarjeta blanca con borde izquierdo rojo carne
  (#DC2626), logo SVG de cuchillo con cuadro de verificación, tipografía Inter.
  El plan describe todo en la sección 17. Sin link de "Crear cuenta" en ningún
  lugar de la página.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin del seed → /api/system/mode retorna 'seed' → cookie
  HttpOnly verificada en DevTools → logout → /dashboard redirige a /login
- Registra el cierre en ESTADO_EJECUCION_STOCKCONTROL.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout base y página de bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. StockControl tiene dos roles con necesidades distintas:
el cajero necesita acceso rápido a registrar ventas; el admin necesita ver
el resumen del negocio. El dashboard es la pantalla que ambos ven al entrar
— debe ser útil para los dos sin ser complicada para ninguno.

Tu mentalidad: la primera pantalla que ve un cajero al entrar al trabajo
debe responder en segundos: ¿hay productos agotados?, ¿cuánto llevamos
vendido hoy? Y debe tener a un clic el botón de "Registrar venta".

Antes de escribir una sola línea de código lee:
1. doc/PLAN_STOCKCONTROL.md — la paleta de colores (sección 17 — rojo carne
   como primario, stone como fondos, verde/naranja/rojo para el stock),
   los componentes DailySummary, LowStockAlert y SeedModeBanner,
   la Fase 2 del plan
2. doc/ESTADO_EJECUCION_STOCKCONTROL.md — verifica Fase 1 completada,
   registra inicio de Fase 2

Puntos críticos que no puedes ignorar:

— El sidebar del cajero tiene: Dashboard, Inventario, Vender, Perfil.
  El sidebar del admin tiene los mismos más: Administración (con sub-ítems:
  Usuarios y Auditoría). El cajero nunca ve las opciones de administración
  — ni en el sidebar ni en ninguna otra parte de la UI.

— El DailySummary en el dashboard muestra tres tarjetas: "Ventas hoy"
  (número de transacciones), "Ingresos hoy" (suma de totales en COP
  formateado como $XX.XXX), "Productos con stock bajo" (conteo de los que
  tienen menos de 5 unidades). La paleta de colores: números en rojo carne
  primario, íconos en stone, fondos en stone 100.

— El LowStockAlert es un banner naranja (#D97706 / fondo #FFFBEB) que
  aparece debajo del DailySummary cuando hay al menos un producto con
  stock < 5. Muestra la lista de productos en alerta con su stock actual.
  Si no hay alertas, el componente no renderiza nada.

— El botón grande "Registrar venta" en el dashboard lleva a /sales y es
  la CTA más prominente de la pantalla. Fondo rojo carne (#DC2626) con
  texto blanco. Tamaño suficiente para ser cómodo en celular.

— La página /admin/db-setup informa qué va a insertar el bootstrap:
  "Aplicará 3 migrations y cargará: 1 usuario admin y 3 productos de demo
  (Salchichón, Queso Costeño, Mortadela)."

— El middleware.ts protege /admin/* solo para role='admin'. El cajero
  que intenta acceder a /admin/users recibe redirect a /dashboard.

Al terminar:
- Probar: bootstrap → modo live → DailySummary muestra datos (aunque vacíos)
  → LowStockAlert no aparece (los productos de demo tienen stock > 5)
- Verificar el sidebar con ambos roles
- Verificar responsive en 375px, 768px y 1280px
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Módulo de Inventario

### Rol: `Ingeniero Fullstack — Gestión de productos y control de stock`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión de
inventarios con validaciones de integridad y diseño de vistas optimizadas
para consulta rápida en entornos de comercio minorista.

Tu mentalidad: el cajero de una salsamentaría consulta el inventario varias
veces al día — para ver si le queda jamón antes de decirle al cliente que
sí hay. La consulta tiene que ser instantánea y la información tiene que
ser clara: nombre, precio y stock a golpe de vista. Los productos agotados
deben saltar a la vista sin tener que leer cada fila.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_STOCKCONTROL.md — migration 0002 con el índice UNIQUE parcial
   en LOWER(name) WHERE is_active=true, reglas RN-02 al RN-03, RN-06 y RN-07,
   los componentes ProductCard, StockBadge y LowStockAlert (sección 17),
   y la Fase 3 completa del plan
2. doc/ESTADO_EJECUCION_STOCKCONTROL.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— El índice UNIQUE parcial es `CREATE UNIQUE INDEX ON products(LOWER(name))
  WHERE is_active = true`. Esto significa que el nombre es único solo entre
  productos activos. Si un producto se desactiva, su nombre puede reutilizarse
  en uno nuevo. Al capturar el error de Postgres por violación del UNIQUE
  (código de error '23505'), retornar 409 con mensaje: "Ya existe un producto
  activo con ese nombre."

— getProductByName usa ILIKE para búsqueda parcial insensible a mayúsculas:
  WHERE LOWER(name) LIKE LOWER('%' || query || '%') AND is_active = true.
  Esto permite buscar "sal" y encontrar "Salchichón" o "Salami".

— updateProductStock SUMA la cantidad al stock actual — no lo reemplaza.
  Si el Queso Costeño tiene 30 unidades y llegan 20 más, el admin ingresa
  20 (no 50). La query es UPDATE products SET current_stock = current_stock + ?
  WHERE id = ?. Nunca UPDATE SET current_stock = ?.

— El StockBadge tiene tres estados:
  Verde (#16A34A / fondo #F0FDF4): stock >= 5 — muestra la cantidad.
  Naranja (#D97706 / fondo #FFFBEB): stock entre 1 y 4 — muestra la cantidad
  con el texto "Bajo".
  Rojo (#DC2626 / fondo #FEF2F2): stock = 0 — muestra "AGOTADO" en bold.

— La vista del inventario tiene dos layouts: tabla en desktop (nombre, precio,
  stock como badge, acciones) y cards en mobile (una card por producto con
  toda la información visible sin scroll horizontal).

— Los botones de "Editar precio" y "Agregar stock" solo aparecen en la vista
  del admin. El cajero ve el inventario en modo lectura — sin botones de
  edición. Esto no solo es una restricción de UI: los endpoints de escritura
  también verifican el rol con withRole(['admin']).

— Al desactivar un producto: mostrar modal de confirmación con el nombre
  del producto: "¿Desactivar 'Salchichón'? El producto no estará disponible
  para nuevas ventas pero su historial se conserva." Si tiene ventas
  previas, el soft delete procede. El producto desaparece del inventario
  activo pero sus ventas históricas lo referencian sin problema.

Al terminar:
- Verificar que los 3 productos de demo del bootstrap aparecen en el inventario
- Agregar un cuarto producto → aparece en la lista
- Intentar agregar otro con el mismo nombre → 409 con mensaje claro
- Probar búsqueda: escribir "sal" → debe encontrar productos que contengan
  esa subcadena (case insensitive)
- Actualizar el stock del Salchichón sumando 10 → verificar que el stock
  aumentó, no que fue reemplazado
- Desactivar un producto → verificar que desaparece del inventario activo
- Verificar que el cajero no puede ver los botones de edición
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_INVENTARIO.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Módulo de Ventas

### Rol: `Ingeniero Fullstack — Flujo de venta, validaciones críticas e historial`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en flujos de
punto de venta, validaciones de stock en tiempo real y diseño de formularios
optimizados para velocidad en entornos de comercio.

Tu mentalidad: el cajero de una salsamentaría registra una venta cada pocos
minutos durante las horas pico. El formulario de venta tiene que ser el
módulo más rápido y confiable del sistema. Un error al registrar una venta,
o peor, una venta que se registre sin descontar el stock, genera un problema
real para el negocio. La operación registerSale en el servidor es la más
crítica del proyecto.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_STOCKCONTROL.md — migration 0003 (sales), reglas RN-01 y RN-04
   al RN-08, la implementación completa de registerSale (sección 11.4 —
   lee el código comentado línea por línea), los componentes SaleForm,
   SaleRow y DailySummary (sección 17), y la Fase 4 completa del plan
2. doc/ESTADO_EJECUCION_STOCKCONTROL.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— registerSale en el dataService sigue esta secuencia EXACTA (como está
  documentada en la sección 11.4 del plan):
  (1) Verificar que el producto existe y tiene is_active = true. Si no:
      retornar 404 "Producto no encontrado o inactivo" (RN-05, RN-07).
  (2) Verificar que current_stock >= quantity. Si no: retornar 409 con
      { available: product.current_stock, requested: quantity } (RN-01).
  (3) UPDATE products SET current_stock = current_stock - quantity.
  (4) INSERT INTO sales con: product_id, sold_by (del JWT), quantity,
      unit_price = product.price (snapshot — RN-08), total = price * quantity.
  (5) recordAudit con el summary legible.
  Esta secuencia NUNCA puede alterarse. El servidor es la única fuente de
  verdad para el stock — el cliente no puede saltarse ningún paso.

— RN-08 — snapshot de precio: unit_price se copia de product.price en el
  momento de la venta. Si el admin cambia el precio del Salchichón de
  $8.500 a $10.000 mañana, las ventas de hoy conservan $8.500 en el
  historial. El total de las ventas de hoy no cambia retroactivamente.
  Verificar esto explícitamente como parte de las pruebas.

— SaleForm en el cliente:
  El buscador de producto usa debounce de 300ms y llama a /api/products/search
  mostrando resultados como dropdown. Al seleccionar un producto, el formulario
  muestra: stock actual disponible (con su StockBadge), precio unitario en
  COP, y un input de cantidad. Al cambiar la cantidad, se calcula y muestra
  el total en tiempo real. Si la cantidad supera el stock, el total aparece
  en rojo y el botón "Registrar venta" se deshabilita con el mensaje
  "Cantidad supera el stock disponible (X unidades)". Esto es UX proactiva —
  el servidor también lo valida, pero es mejor no dejar que el cajero llegue
  al error del servidor.

— Al confirmar la venta: el botón muestra un spinner (la operación tarda
  < 500ms pero el feedback visual es importante). Al completar:
  Toast verde: "✓ Venta registrada — $XX.XXX" (con el total formateado).
  El formulario se limpia completamente para la siguiente venta.
  El historial del día se actualiza automáticamente (puede ser un refetch
  o un estado optimista).

— Los precios en toda la interfaz usan formato COP: número entero con
  separador de miles (punto en Colombia). Ejemplo: $8.500, $25.500, $120.000.
  Nunca mostrar decimales para COP en esta app (los centavos no aplican en
  salsamentarías). Usar Intl.NumberFormat('es-CO', { style: 'currency',
  currency: 'COP', maximumFractionDigits: 0 }).

— El historial del día en /sales/page.tsx muestra las ventas del día en
  curso ordenadas por sold_at DESC. Cada fila: hora (HH:MM), nombre del
  producto, cantidad, precio unitario, total. Al final de la lista,
  un resumen: "N ventas · Total del día: $XXX.XXX".

— /sales/history/page.tsx (solo admin): filtro por rango de fechas y por
  producto. Tabla con fecha completa, hora, producto, cajero (nombre),
  cantidad, precio unitario y total. Exportación básica no requerida en v1.

Al terminar:
- Probar el flujo completo: seleccionar producto → ingresar cantidad →
  ver total calculado → confirmar → toast verde → producto aparece en el
  historial → stock del producto disminuyó
- Probar RN-01: intentar vender 100 unidades de un producto con solo 30 →
  debe retornar 409 con el stock disponible, sin modificar nada en la DB
- Probar RN-08: cambiar el precio de un producto → hacer una nueva venta →
  verificar en la tabla sales que unit_price de la venta nueva tiene el
  precio nuevo, y las ventas anteriores tienen el precio anterior
- Verificar los precios en formato COP en toda la interfaz ($8.500, etc.)
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_VENTAS.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Administración de Usuarios y Pulido Final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de StockControl.

Tu mentalidad: StockControl lo usa una cajera todos los días para registrar
ventas de jamón y queso. Si la app tiene un empty state genérico, un mensaje
de error que no explica qué pasó, o una interfaz que no funciona bien en
celular, esa cajera pierde confianza en la herramienta y vuelve al cuaderno.
Esta fase termina cuando el sistema sea confiable y cómodo para el uso diario
en producción.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_STOCKCONTROL.md — Fase 5 completa, los requerimientos no
   funcionales (RNF-01 al RNF-06) y las restricciones del sistema
   (sección 20)
2. doc/ESTADO_EJECUCION_STOCKCONTROL.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Lo que debes completar en esta fase:

Administración de usuarios:
API Routes con withRole(['admin']): GET/POST /api/users, GET/PUT /api/users/[id].
El POST genera contraseña temporal con crypto.randomBytes (12 chars
alfanuméricos), la hashea con bcrypt, marca must_change_password=true,
retorna en claro una sola vez con modal de advertencia y botón "Copiar".
En el login: si must_change_password=true, redirigir a /profile para cambio
obligatorio antes de acceder al sistema.
Crear app/admin/users/page.tsx: tabla con nombre, email, rol (cajero/admin),
estado (activo/suspendido) y último acceso. Acciones: activar/suspender.
El admin no puede suspenderse a sí mismo — verificación explícita en la API.
Crear app/admin/audit/page.tsx: AuditViewer con selector de mes.

Auditoría de empty states con mensajes prácticos:
- Inventario vacío (si el admin borró todos los productos):
  "No hay productos registrados. Agrega el primer producto para empezar."
  Con botón "Agregar producto" (solo admin).
- Historial del día sin ventas: "No hay ventas registradas hoy."
  Con botón "Registrar venta".
- Búsqueda sin resultados: "No se encontró ningún producto con '[término]'.
  Verifica el nombre o agrega el producto."
- Historial completo sin datos para los filtros: "No hay ventas en el
  período seleccionado."

Manejo de errores global:
- 401 (sesión expirada): toast "Tu sesión expiró" + redirect a /login.
- 403 (sin permisos de rol): toast "No tienes permisos para esta acción."
- 409 con stock insuficiente: no es un toast pequeño — es una alerta
  prominente en el formulario de venta con el mensaje exacto:
  "Stock insuficiente. Solo quedan [N] unidades de [producto]."
- 409 con nombre duplicado en producto: toast "Ya existe un producto activo
  con ese nombre."
- 500: toast genérico con botón "Reintentar".

Verificación del formulario de venta en celular (RNF-03):
En 375px: el buscador de producto debe funcionar bien con teclado táctil.
El input de cantidad debe ser tipo number con teclado numérico en mobile
(inputMode="numeric"). El botón "Registrar venta" debe tener al menos 48px
de alto. El total calculado debe ser legible (tamaño de fuente suficiente).

Verificación de que los precios están en formato COP en TODA la interfaz:
Revisar pantalla por pantalla que no hay ningún número de precio mostrado
sin formato (sin símbolo $, sin separadores de miles o con decimales).
El formato correcto en todos los casos: $8.500, $25.500, $1.200.000.

Verificación de roles en producción:
Crear un usuario cajero desde el admin → cajero hace login → verificar que:
  - No ve el menú Administración en el sidebar.
  - Puede acceder a /inventory (solo lectura, sin botones de edición).
  - Puede acceder a /sales y registrar ventas.
  - /admin/users retorna redirect a /dashboard.
  - /inventory/new retorna 403 desde la API.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso sin errores
- Verificar que ningún componente cliente importa variables privadas ni
  módulos de lib/ directamente
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo con ambos roles:
Admin: bootstrap → ver 3 productos de demo → agregar un cuarto producto →
actualizar el stock de uno → crear usuario cajero con contraseña temporal.
Cajero: primer login → cambiar contraseña obligatoria → ver inventario →
registrar 3 ventas → ver historial del día con los totales.
Admin: ver historial completo → ver la auditoría en Blob con los eventos
de las ventas y los cambios de inventario.

Al cerrar el proyecto:
- Registra la Fase 5 como Completada en ESTADO_EJECUCION_STOCKCONTROL.md
  con la URL de producción de Vercel en el historial
- Crea doc/RESUMEN_FASE_5_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack utilizado, tablas de
  Supabase creadas con descripción, decisiones técnicas destacadas (índice
  UNIQUE parcial por nombre, registerSale como operación secuencial en
  servidor, snapshot de precio, updateStock como suma no reemplazo) y
  estado final del proyecto

El proyecto StockControl está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Yarith Jiménez — Doc: 1082926628
> Curso: Lógica y Programación — SIST0200
