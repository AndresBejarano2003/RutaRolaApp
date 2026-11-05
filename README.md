# RutaRola — Frontend

Sistema de gestión de transporte escolar (estudiantes, acudientes, empleados, finanzas, rutas y vehículos).
Construido con **Angular 21** (standalone, zoneless, signals), **Tailwind CSS 4** y **DaisyUI 5**.

## Comandos

```bash
npm install            # instalar dependencias
npm start              # servidor de desarrollo → http://localhost:4200
npm test               # pruebas unitarias (Vitest)
npm run build          # build de producción → dist/RutaRolaApp
```

Antes de entregar cualquier cambio: `npm test` y `npm run build` deben pasar sin errores ni advertencias.

---

# Reglas de negocio del sistema

Estas reglas son **obligatorias** para todas las pantallas. Cualquier regla nueva que aplique a todo el
sistema se agrega aquí y en `CLAUDE.md`.

## 1. Estructura del proyecto

Se sigue la guía de estilo oficial de Angular: **organización por funcionalidad** y nombres sin sufijo
`.component` (`estudiantes-page.ts` → `export default class EstudiantesPage`). Nombres de archivos,
rutas, variables y textos en **español**.

```
src/app/
  core/           servicios globales (auth, whatsapp) y repositorios.ts (fuente de datos de cada módulo)
  modulos.routes.ts  módulos internos (con layout) cargados de forma diferida junto con los repositorios
  layout/         shell, barra-superior, campana-notificaciones, menu-lateral (opciones-menu.ts)
  shared/         piezas reutilizables (crud, modal, paginación, notificaciones, formularios, catálogos, fechas, exportar, pruebas)
  autenticacion/  login, registro, recuperar
  inicio/         dashboard, perfil, configuración, notificaciones
  personas/  finanzas/  operacion/  sistema/     una carpeta por pantalla + <modulo>.routes.ts
```

**Agregar una pantalla:**
1. Crear `<modulo>/<nombre>/<nombre>-page.ts` y `.html`.
2. Registrar la ruta en `<modulo>/<modulo>.routes.ts` con su `data.breadcrumb`.
3. Agregar la opción en `layout/menu-lateral/opciones-menu.ts`.
4. Mientras no tenga contenido, la ruta apunta a `shared/en-construccion`.

## 2. Estructura de toda pantalla CRUD

Toda pantalla de registros (estudiantes, acudientes, empleados, colegios, vehículos, rutas, asignaciones,
cotizaciones, facturas, recibos, programación…)
tiene **filtros, listado paginado y una ventana modal para registrar, modificar y consultar**, más
confirmación para eliminar. La implementación de referencia es **`personas/estudiantes/`**.

| Archivo | Responsabilidad |
|---|---|
| `<entidad>.ts` | Modelo (extiende `Entidad`), interfaz de filtros y filtros vacíos |
| `<plural>-repositorio.ts` | Contrato abstracto de acceso a datos (token de inyección) |
| `<plural>-local.ts` | Almacenamiento **temporal** en el navegador (`localStorage`) con datos de ejemplo y validaciones de negocio |
| `<plural>-http.ts` | Conexión al API REST, lista para usar |
| `<plural>-store.ts` | Estado de la pantalla con signals: listado, filtros, paginación, cargando, guardando, errores (`extends CrudStore`; listados de solo lectura: `extends ListadoStore`) |
| `<plural>-filtros/` | Filtros con búsqueda en vivo y botón **Limpiar** |
| `<plural>-tabla/` | Listado con acciones **Consultar / Editar / Eliminar** |
| `<entidad>-formulario/` | **Solo los campos** del formulario, con modos **crear / editar / consultar** (solo lectura) y validaciones |
| `<plural>-page.ts` | Orquesta todo; `extends PaginaCrud` (modal, modos, guardar y verificación antes de eliminar ya resueltos) y usa `app-encabezado-listado`, `app-modal`, `app-acciones-formulario`, `app-dialogo-confirmacion` y `app-paginacion` |

La página solo declara su `store`, sus `titulos` (crear/editar/consultar) y `describir(registro)` para el
diálogo de eliminar; lo demás lo hereda de `shared/crud/pagina-crud.ts`.

Comportamiento obligatorio:
- Clic en una fila = **consultar**. Desde la consulta se puede pasar a **editar**.
- **Eliminar** siempre pide confirmación.
- Al guardar, eliminar o fallar se muestra una **notificación** (toast).
- Mientras se guarda, los botones se deshabilitan y muestran un spinner.
- Los campos obligatorios se marcan con `*` y cada error se explica debajo del campo.
- Listado vacío: mensaje claro (y botón de crear si no hay filtros activos).

### Datos temporales y conexión al API

Mientras no exista el backend, los registros se guardan en `localStorage` (clave `rutarola.<recurso>`) y la
pantalla muestra el indicador **"Modo local"**. Para conectar el API se cambia **una línea** en
`core/repositorios.ts`:

```ts
{ provide: EstudiantesRepositorio, useClass: EstudiantesLocal }   // hoy
{ provide: EstudiantesRepositorio, useClass: EstudiantesHttp }    // con API
```

`RepositorioLocal` simula el servidor y tiene ganchos para que cada módulo declare las mismas reglas que
deberá aplicar el API:

- `validar(datos, idActual, registros)`: reglas síncronas (duplicados, rangos de fechas…).
- `validarRelaciones(datos, idActual)`: reglas que consultan **otros módulos** (p. ej. una asignación
  revisa capacidad del vehículo, licencia del conductor y documentos vencidos).
- `preparar(datos, registros)`: datos que genera el servidor (consecutivos `FAC-0001`, `REC-0001`, `COT-0001`).
- `motivoNoEliminar(id)`: integridad referencial (ver abajo).
- La latencia simulada sale del token `LATENCIA_LOCAL` (300 ms; 0 en pruebas).

Cada `*Http` documenta en su comentario los endpoints y respuestas (409/422) que espera.

Contrato REST que espera `RepositorioHttp` (`environment.apiUrl`):

| Operación | Petición | Respuesta |
|---|---|---|
| Listar | `GET /{recurso}?pagina=1&tamano=10&<filtros>` | `{ items, total, pagina, tamano }` |
| Consultar | `GET /{recurso}/{id}` | registro |
| Crear | `POST /{recurso}` | registro creado |
| Modificar | `PUT /{recurso}/{id}` | registro actualizado |
| Eliminar | `DELETE /{recurso}/{id}` | vacío |

| Opciones para listas | `GET /{recurso}/opciones?<filtros>` | `[{ id, nombre }]` (p. ej. `/estudiantes/opciones?acudienteId=acu-1`) |

Endpoints adicionales (solo lectura o calculados en el servidor):

| Pantalla | Petición | Respuesta |
|---|---|---|
| Conductores | `GET /conductores?<filtros>` | conductores (empleados) con licencia y asignación activa |
| Historial de envíos | `GET /programaciones/{id}/envios` | envíos del proceso automático |
| Conteo de envíos | `GET /programaciones/envios/conteo?ids=` | `{ [id]: cantidad }` |
| Reporte de ingresos | `GET /reportes/ingresos?desde=&hasta=&medioPago=` | totales, por mes, por medio y recibos |
| Facturas pendientes | `GET /reportes/facturas-pendientes?texto=&acudienteId=&situacion=` | cuotas sin recibo |
| Morosos | `GET /reportes/morosos?texto=&diasMinimos=` | acudientes con cuotas vencidas |


Errores: el API puede responder `{ "mensaje": "..." }` y se mostrará tal cual; si no, se usa un mensaje
según el código (409 = duplicado o registro en uso, 404 = no existe, 0 = sin conexión…).

### Repositorios: un solo registro para toda la app

Los módulos se enlazan entre sí (estudiantes ↔ colegios ↔ rutas ↔ asignaciones ↔ vehículos/empleados;
acudientes ↔ facturas ↔ recibos ↔ programación ↔ reportes). Por eso **todos** los repositorios se
declaran en un único lugar, `core/repositorios.ts` (`proveerRepositorios()`), que se aplica en la ruta
padre de `modulos.routes.ts`. Así todas las pantallas comparten las mismas instancias, y los
repositorios se cargan de forma diferida (no inflan el bundle inicial). Ninguna pantalla ni módulo
declara sus propios repositorios.

Cuando un repositorio local necesita a otro que a su vez lo necesita (p. ej. empleados ↔ asignaciones),
lo obtiene de forma diferida con `Injector.get()` dentro del método, no con `inject()` en el campo.

### Relaciones entre registros

- Una lista que muestra registros de **otra pantalla** (por ejemplo, el acudiente de un estudiante) se
  llena con `repositorio.opciones(filtros?)`, **nunca** con datos fijos en `shared/catalogos`. Los
  catálogos son solo para valores fijos: tipos de documento, grados (Jardín, Transición, 1° … 11°),
  jornadas… Ejemplos: los estudiantes de un acudiente (`opciones({ acudienteId })`), los cursos del
  colegio elegido.
- **Integridad:** no se puede eliminar un registro que otros usan. Por ejemplo, un acudiente con
  estudiantes a cargo o facturas, un colegio con estudiantes o rutas, un vehículo o empleado con
  asignaciones, una factura con recibos o programación.
  - Cada repositorio declara `motivoNoEliminar(id)` (devuelve el motivo o `null`); `eliminar` lanza
    `ErrorCrud(..., 'EN_USO')` y el API debe responder **409** con `mensaje`.
  - La pantalla lo verifica antes. El diálogo explica el motivo con `[permitirConfirmar]="false"`, que
    muestra solo el botón "Entendido".
  - Se sugiere marcar el registro como **Inactivo** en lugar de eliminarlo.
- Todo registro tiene `estado: EstadoRegistro` (`'ACTIVO' | 'INACTIVO'`), mostrado con
  `<app-badge-estado>` (`textoActivo`/`textoInactivo` para "Vigente/Anulada", "Válido/Anulado").
- **Documentos financieros con copia de datos:** factura, recibo y cotización guardan el nombre del
  acudiente, del estudiante y el número de factura con que se expidieron (no cambian si luego se edita
  la persona).

### Reglas de cada módulo

- **Colegios:** NIT único; "Agregar cursos" llena los cursos **desde Jardín hasta el curso elegido** con
  la hora de entrada y salida indicadas (cada curso se puede modificar o quitar después). El grado de un
  estudiante se elige entre los cursos activos de su colegio.
- **Vehículos:** placa e interno únicos; vencimientos de SOAT, tecnomecánica, tarjeta de operación y
  pólizas con alerta a 30 días (`app-badge-vencimiento`).
- **Rutas:** código único; estudiantes del colegio de la ruta; un estudiante no puede estar en dos rutas
  activas de la misma jornada.
- **Asignaciones (ruta + vehículo + conductor + monitora):** una activa por ruta; conductor de tipo
  conductor con licencia vigente; vehículo activo, con capacidad suficiente y documentos al día; un
  vehículo o persona no cubre dos rutas de la misma jornada.
- **Conductores:** vista de solo lectura de los empleados conductores con su licencia y ruta asignada;
  se editan en Personas › Empleados y se asignan en Operación › Asignaciones.
- **Cotizaciones:** acudiente/estudiantes registrados (selectores) o cliente nuevo (texto);
  total = valor por estudiante × estudiantes.
- **Facturas (contrataciones):** valor **mensual** por estudiante entre un mes inicial y uno final; el
  estudiante debe ser del acudiente; un estudiante no tiene dos facturas vigentes que se crucen.
- **Recibos:** pagan un mes de una factura vigente; un mes no se paga dos veces.
- **Programación de facturación:** una por factura; día límite (1–31) y días previos (1–10); por cada canal
  activo (WhatsApp / correo) hay mensajes predefinidos y **exactamente uno "En uso"**; los envíos los
  hace el servidor y se ven en el historial.
- **Reportes:** ingresos (recibos válidos por fecha de pago), facturas pendientes (meses sin recibo hasta
  el mes en curso) y morosos (cuotas vencidas según el día límite de la programación, o el día 5).
- **Centro de Ayuda (`sistema/soporte`):** manuales, tutoriales y preguntas frecuentes se editan solo en
  `contenido-ayuda.ts`; las respuestas deben coincidir con las rutas y reglas vigentes (actualizarlas
  cuando cambie un módulo). La búsqueda filtra los tres a la vez. Una **solicitud de soporte** exige tipo
  (error, consulta, mejora, capacitación), módulo afectado (sale del menú con `modulosDelMenu()`, nunca
  de una lista fija), prioridad (Media por defecto), asunto de 5 a 120 caracteres y descripción de 20 a
  2000; admite hasta 3 adjuntos (PDF o imagen, 1 MB c/u). El consecutivo `SOP-0001` lo asigna el servidor.
  WhatsApp se abre con lo que el usuario ya escribió en el formulario.

### Inicio (`inicio/dashboard/`)

La pantalla principal resume el estado del negocio con **datos reales** de todos los módulos (nunca cifras
fijas). `TableroRepositorio` entrega un `Tablero` calculado por `calcular-tablero.ts` (reglas puras que el
API debe replicar en `GET /tablero`); se recalcula cuando se guarda o elimina un registro.

- **Encabezado:** saludo, fecha, mes del resumen, "Modo local" y accesos rápidos (Registrar pago, Nueva
  factura, Nuevo estudiante, Nueva cotización) que abren el formulario de creación con `?accion=nuevo`.
- **Indicadores** (cada tarjeta lleva a su pantalla):
  - *Recaudo del mes:* recibos vigentes que pagan el mes en curso frente al valor mensual de las facturas
    vigentes que lo cubren (barra de %), número de pagos y el recaudo del mes anterior como referencia.
  - *Cartera vencida:* valor de las cuotas con la fecha límite vencida, acudientes en mora y lo que aún está
    en plazo este mes.
  - *Estudiantes activos:* colegios, nuevos del mes y cuántos no tienen ruta.
  - *Operación:* rutas activas, vehículos, conductores y % de cupos ocupados.
- **Requiere atención** (reemplaza las alertas fijas): solo lo que tiene cantidad > 0, de lo crítico a lo
  informativo, y cada fila lleva a la pantalla donde se resuelve: acudientes en mora, vehículos con documentos
  vencidos, licencias vencidas, recordatorios fallidos (30 días), estudiantes sin ruta, rutas sin vehículo ni
  conductor, documentos y licencias por vencer (30 días), contratos que terminan este mes o el siguiente,
  facturas vigentes sin programación de cobro y cotizaciones pendientes. Si no hay nada: "Todo en orden".
- **Próximos 30 días** (reemplaza "Actividad reciente"; la actividad ya está en la campana): vencimientos de
  documentos y licencias, fechas límite de pago (agrupadas por día) y fin de contratos.
- **Últimos pagos:** los 5 recibos más recientes.
- **Gráficas:** facturado vs recaudado (6 o 12 meses), estudiantes por colegio (5 principales + Otros) y
  ocupación de cada ruta frente a la capacidad del vehículo asignado (≥ 90 % en amarillo; sin vehículo, aviso).
  Los colores de ApexCharts son los del tema (`COLORES` en `dashboard-page.ts`).

### Centro de notificaciones (`inicio/notificaciones/`)

La campana de la barra superior y la página `/inicio/notificaciones` muestran lo que pasa en el sistema.
No confundir con los toasts (`shared/notificaciones`), que son mensajes pasajeros de una acción.

- **Quién las crea:** el **servidor** (por evento y con un proceso diario). El usuario solo las lee,
  marca como leídas/no leídas, archiva/restaura y elimina. Hoy, en modo local, las genera
  `NotificacionesLocal` a partir de los datos del navegador.
- **Qué se notifica** (reglas en `generar-notificaciones.ts`, que el API debe replicar):

  | Categoría | Hecho | Prioridad |
  |---|---|---|
  | Pagos y cartera | Pago recibido (recibo vigente) | Éxito |
  | Pagos y cartera | Acudiente en mora (cuotas vencidas) | Crítica |
  | Facturas y contratos | Nueva factura | Informativa |
  | Facturas y contratos | Contrato por terminar (termina este mes o el siguiente) | Advertencia |
  | Facturas y contratos | Contrato terminado con la factura aún vigente | Informativa |
  | Cotizaciones | Nueva cotización / aprobada / rechazada | Informativa / Éxito |
  | Vencimientos | SOAT, técnico-mecánica, tarjeta de operación o pólizas por vencer (30 días) / vencidos | Advertencia / Crítica |
  | Vencimientos | Licencia de conductor activo por vencer / vencida | Advertencia / Crítica |
  | Operación / Personas | Vehículo o empleado registrado | Informativa |
  | Envíos | Recordatorio de cobro enviado / fallido | Informativa / Crítica |

  Los eventos (registros, pagos, envíos) solo se notifican si ocurrieron en los últimos **30 días**.
- **Sin repetidos:** cada notificación tiene una `clave` que identifica el hecho (p. ej.
  `licencia:{id}:{fecha}:VENCIDA`). Un hecho se notifica **una sola vez**, aunque se elimine. Si se vence
  otra cuota o se renueva un documento, la clave cambia y llega una notificación nueva.
- **Campana:** número de no leídas (rojo si hay críticas, máximo "99+"), las 6 más recientes,
  "Marcar todas como leídas" y "Ver todas". Al hacer clic en una, se marca leída y se abre expandida en
  la página (`?abrir=<id>`). En teléfonos el panel ocupa todo el ancho.
- **Página:** bandeja de entrada y archivadas; filtros por texto, categoría, prioridad y lectura; agrupadas
  por fecha (Hoy, Ayer, Últimos 7 días, Anteriores); al expandir se ve el mensaje completo, la fecha, la
  prioridad y el botón para ir a la pantalla relacionada. Selección múltiple para marcar, archivar o
  eliminar. Archivar también la marca como leída.
- **Eliminar:** una notificación se elimina de inmediato; varias seleccionadas o "Vaciar bandeja" piden
  confirmación con `<app-dialogo-confirmacion>`.
- **Actualización:** `CentroNotificaciones` (estado compartido, registrado en `core/repositorios.ts`) se
  refresca al iniciar, cada 60 s y cada vez que se guarda o elimina un registro en cualquier módulo
  (`CrudStore` → `CambiosDatos.notificar()`).
- **API** (`NotificacionesHttp`): `GET /notificaciones`, `GET /notificaciones/resumen`,
  `PATCH /notificaciones/lectura`, `POST /notificaciones/leer-todas`, `PATCH /notificaciones/archivo`,
  `POST /notificaciones/eliminar`, `DELETE /notificaciones?bandeja=`; solo afectan las del usuario autenticado.

### Piezas compartidas de personas (`personas/compartido/`)

Estudiantes, acudientes y empleados comparten los datos de identificación.

- **`DatosPersona`:** tipo y número de documento, primer y segundo nombre, primer y segundo apellido.
- **`controlesPersona(fb)`:** los controles del formulario con sus validaciones:
  - documento alfanumérico de 5 a 15 caracteres;
  - nombres de máximo 50 caracteres.
- **`limpiarPersona(datos)`:** limpia los datos antes de guardar.
- **`<app-campos-persona />`:** las secciones "Identificación" y "Datos personales". Se pone dentro del
  `<form>`, y `[tiposDocumento]` restringe los tipos permitidos (por ejemplo, empleados no usan RC/TI).
- **Funciones auxiliares:**
  - `nombreCompleto`, `iniciales`;
  - `coincideTexto`: filtro por nombre o documento;
  - `compararPorApellido`: orden del listado;
  - `validarDocumentoUnico`: no permite documentos repetidos.
- **`<app-celda-persona>`:** primera columna de la tabla, con avatar de iniciales, nombre y detalle.

### Archivos adjuntos

Se usa `<app-archivo-adjunto formControlName="contrato" aceptar=".pdf,image/*" [tamanoMaximoMb]="2" />`
(varios archivos: `<app-archivos-adjuntos [maximo]="3" />`, valor `ArchivoAdjunto[]`).

- Valida el tipo y el tamaño del archivo.
- Permite ver o descargar, reemplazar y quitar el archivo.
- En consulta queda en solo lectura.
- En modo local el archivo se guarda dentro del registro (data URL), por eso el límite es de **2 MB**.
  Si el navegador se queda sin espacio, se muestra el error `SIN_ESPACIO`.
- Con API, el archivo viaja en el JSON (base64), o se sobrescribe `crear`/`actualizar` en el `*Http`
  para enviarlo como `multipart/form-data`.

### Formato colombiano

La app usa `LOCALE_ID = 'es-CO'`. Los valores en dinero se muestran con
`{{ valor | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}` (ejemplo: $ 2.200.000).

### Utilidades compartidas

- `shared/fechas`: `fechaIso`, `periodoDe`, `sumarMeses`, `periodosEntre`, `nombrePeriodo`,
  `diaDelPeriodo`, `diasEntre`, `fechaCorta`, `horaLegible` (meses como `YYYY-MM`).
- `shared/exportar/csv.ts`: `descargarCsv()` (separador `;` y BOM para Excel en español).
- `shared/formularios`: validadores `nit`, `placa`, `posteriorA(inicio, fin)` y `emitirEnVivo(form, salida)`
  para filtros con búsqueda en vivo.
- `shared/paginacion/paginacion-local.ts`: `PaginacionLocal` para paginar en el cliente (reportes) con
  `<app-paginacion>`.

### Pruebas

`shared/pruebas/pruebas.ts` ofrece lo necesario para probar las pantallas:

- `repositoriosDePrueba()`: todos los repositorios de `core/repositorios.ts`, sin latencia;
- `simularDialogos()`: simula los diálogos del navegador (y `ResizeObserver` para las gráficas);
- `estabilizar()`, `pantalla(el)`: escribir en campos, elegir en selectores y pulsar botones.

Toda pantalla nueva incluye su `*-page.spec.ts` con estos casos:

- listar;
- filtrar;
- crear con validación;
- eliminar.

Las reglas de negocio que cruzan módulos se prueban sobre los repositorios
(`operacion/reglas-operacion.spec.ts`, `finanzas/reglas-finanzas.spec.ts`).

## 3. Diseño y colores

El sistema usa **un único tema oscuro, `rutarola`**, definido en `src/styles.css`. Los colores salen del
logo: **amarillo del bus** (acción principal) y **rojo de las montañas** (acento de marca).

**Regla:** en las plantillas se usan las clases semánticas del tema, **nunca grises o azules fijos**
(`bg-gray-800`, `text-gray-500`, etc.).

| Clase | Color | Uso |
|---|---|---|
| `bg-base-100` | #111827 | Fondo de página, inputs y selects |
| `bg-base-200` | #1f2937 | Tarjetas, modales, tablas |
| `bg-base-300` | #374151 | Encabezado de tabla, hover de filas, botones neutros |
| `text-base-content` | #f3f4f6 | Texto principal |
| `text-base-content/70` | — | Texto secundario (**mínimo permitido para texto**) |
| `primary` | #facc15 | Acción principal de la vista (una por vista), página actual, editar |
| `secondary` | #2563eb | Acciones secundarias y enlaces |
| `accent` | #dc2626 | Acentos de marca (no para errores) |
| `info` | #38bdf8 | Consultar, títulos de sección en formularios |
| `success` | #4ade80 | Estado activo, confirmaciones |
| `warning` | #fbbf24 | Avisos, "Modo local" |
| `error` | #f87171 | Eliminar, errores de validación |

**Contraste:** todo par texto/fondo debe cumplir **WCAG AA (≥ 4.5:1)**. Ejemplo: texto principal sobre
tarjeta = 13.3:1; texto secundario `/70` = 7.3:1. No se permite `gray-500` sobre tarjetas (3.0:1).

### Componentes estándar

- **Tarjeta:** `card bg-base-200 border border-base-300 shadow-xl`.
- **Input / select:** `input input-bordered bg-base-100 border-neutral` (igual para `select`).
- **Tabla:**
  - contenedor `@container overflow-x-auto rounded-box border border-base-300` (ver "Diseño responsive");
  - encabezado `bg-base-300 text-base-content/80 text-xs uppercase tracking-wide`;
  - filas `border-base-300 hover:bg-base-300/50 cursor-pointer`;
  - estados con `badge badge-soft` (verde = activo, gris = inactivo);
  - acciones con íconos y tooltip: consultar `text-info`, editar `text-primary`, eliminar `text-error`.
- **Listas de selección (filtros y formularios, en todas las pantallas):** nunca un `<select>` simple;
  siempre `<app-selector-busqueda>`, para que el usuario encuentre su registro **escribiendo**, aunque
  haya cientos.
  - Busca sin importar tildes ni mayúsculas.
  - Teclado: ↑/↓ para moverse, Enter selecciona, Esc cierra.
  - La opción elegida se marca con ✓ y aparece "Sin resultados" si nada coincide.
  - Se abre hacia arriba cuando no hay espacio debajo, por ejemplo al final de un modal.
  - **En filtros:** `textoTodos="Todos los …"` agrega la opción "Todos" y el botón ✕.
  - **En formularios:** `[invalido]="!!error('campo')"` lo marca en rojo. Va dentro de un `<div>` con
    su `<span class="label-text">`, **no** dentro de un `<label>`.
  - **Excepción:** 2 a 4 opciones fijas que conviene ver a la vez (p. ej. tipo y prioridad de una
    solicitud de soporte) pueden ir como tarjetas de opción: `<label>` + radio `sr-only` +
    `has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:outline-2`.

  ```html
  <!-- Filtro -->
  <app-selector-busqueda formControlName="colegioId" [opciones]="colegios()"
    textoTodos="Todos los colegios" etiqueta="Colegio" />

  <!-- Formulario -->
  <div class="flex flex-col w-full">
    <span class="label-text text-base-content/90 mb-1">Colegio <span class="text-error">*</span></span>
    <app-selector-busqueda formControlName="colegioId" [opciones]="colegios()"
      etiqueta="Colegio" [invalido]="!!error('colegioId')" />
  </div>
  ```
- **Paginación:** siempre `<app-paginacion>`: números de página, la actual en amarillo (`btn-primary`),
  "Mostrando a–b de n" y selector de filas por página (10/25/50).
- **Abrir el formulario desde otra pantalla:** toda página CRUD (`PaginaCrud`) abre el formulario de
  creación si la URL trae `?accion=nuevo` (p. ej. `/finanzas/recibos?accion=nuevo`).
- **Modal:** `<app-modal>`; eliminar con `<app-dialogo-confirmacion>`. Ver la regla de modales abajo.
- **Piezas de pantalla:** `<app-encabezado-listado>` (título, total, "Modo local", botón Nuevo, error con
  Reintentar), `<app-acciones-fila>` (Consultar / Editar / Eliminar), `<app-estado-vacio>`,
  `<label app-campo etiqueta requerido [error]>` (o `<div app-campo>` alrededor de un selector) y
  `<app-titulo-seccion>` para las secciones del formulario; `<app-lista-seleccion>` para elegir varios
  registros (p. ej. estudiantes de una ruta).
- **Botón principal:** `btn btn-primary` (amarillo con texto oscuro).
- **Mensajes:** siempre con toasts (`NotificacionesService`), nunca `alert()`.
- **Accesos rápidos:** la tarjeta completa es el botón (`<button class="card …">` con ícono de color);
  no se ponen botones de colores dentro de cada tarjeta (así se mantiene un solo `btn-primary` por vista).
- **Navegación dentro de la página:** nunca `href="#…"` (con la URL `/#/…` cambiaría de ruta); la sección
  lleva un `id` y `scroll-mt-4` y se llega con `scrollIntoView`.
- **Videos y PDF incrustados:** se abren en `<app-modal>`. Los videos usan `aspect-video` (nunca alto
  fijo) y `youtube-nocookie.com`; los PDF ofrecen además "Abrir en otra pestaña" y "Descargar", porque
  los navegadores de celular no muestran PDF dentro de un iframe.

### Diseño responsive (obligatorio)

El sistema debe verse bien en teléfonos (iPhone/Android, desde 320 px, vertical y horizontal),
tablets, portátiles y pantallas grandes y extra grandes. Se verifica en 320, 375, 768, 1024, 1280,
1920 y 2560 px.

- **Layout (`layout/shell`):** altura `h-dvh` (correcta con las barras del navegador móvil), barra
  superior con botón ☰ por debajo de `lg` y menú lateral fijo desde `lg`. El menú se cierra al elegir
  una opción. El contenido tiene `min-w-0`, padding `px-3 sm:px-4 lg:px-6` y un ancho máximo de
  1920 px centrado. Se respetan las zonas seguras del iPhone (`viewport-fit=cover`, `env(safe-area-inset-*)`).
- **Nunca hay scroll horizontal de la página.** Lo ancho (tablas) se desplaza dentro de su tarjeta.
- **Tablas:**
  - contenedor `@container overflow-x-auto …`;
  - filas de una sola línea (los encabezados sí pueden partirse);
  - la última columna (acciones o valor) queda fija a la derecha;
  - las columnas secundarias se muestran según el **ancho de la tarjeta** (container queries), no
    de la ventana: `hidden @3xl:table-cell` (≥ 768 px), `@5xl:` (≥ 1024 px), `@6xl:` (≥ 1152 px);
  - desde 768 px de tarjeta la tabla debe caber completa sin desplazarse;
  - una celda con listas largas puede usar `whitespace-normal min-w-44`.
- **Filtros:** van dentro de `<app-panel-filtros (limpiar)="…">`. Se pliegan en teléfonos (también en
  horizontal) y siempre están abiertos en pantallas `amplio:` (≥ 768 px de ancho y ≥ 512 px de alto).
- **Grids:** siempre empiezan en una columna en móvil (`grid-cols-1 md:grid-cols-2 …`); los hijos de
  un grid tienen `min-width: 0` (global) para que nada los ensanche.
- **Modales:** en teléfono se abren como hoja inferior (`modal-bottom`) y en pantallas `sm+` centrados;
  título y padding más compactos en móvil.
- **Grupos de botones o encabezados con acciones:** `flex flex-wrap gap-2`, nunca anchos fijos. Los
  menús desplegables usan `max-w-[calc(100vw-1rem)]`.
- Los íconos de Font Awesome no aceptan utilidades de visibilidad (`md:hidden`) porque su CSS les gana:
  se envuelven en un `<span>` con la utilidad.

### Regla de modales: botones siempre visibles

Todo modal o panel con formulario tiene **tres zonas**:

1. **Encabezado fijo:** título, subtítulo y botón cerrar.
2. **Cuerpo con scroll propio:** si el formulario es largo, solo esta zona hace scroll.
3. **Pie fijo:** los botones (Cancelar/Cerrar, Editar, Guardar) siempre están visibles, sin que el usuario
   tenga que bajar hasta el final.

Cómo se implementa:
- `<app-modal>` ya trae las tres zonas. Todo lo que lleve el atributo `pie` se ubica en el pie.
- El componente de formulario contiene **solo los campos**: `<form [id]="idFormulario()">`, sin botones.
- Los botones se ponen con `<app-acciones-formulario pie formulario="form-x">`. Ese componente:
  - muestra Cancelar/Cerrar, Editar (en consulta) y Guardar con spinner;
  - envía el formulario con el atributo HTML `form`.
- Cada zona va en su propio bloque `@if (modalAbierto())` con **un único elemento raíz**. Si no, Angular
  no lo proyecta en el pie.
- Los diálogos de confirmación también llevan sus botones en el pie.

```html
<app-modal [(abierto)]="modalAbierto" [titulo]="titulo()">
  @if (modalAbierto()) {
    <app-x-formulario idFormulario="form-x" [modo]="modo()" (guardar)="guardar($event)" />
  }
  @if (modalAbierto()) {
    <app-acciones-formulario pie formulario="form-x" [modo]="modo()" [guardando]="store.guardando()"
      textoCrear="Registrar x" (cancelar)="modalAbierto.set(false)" (editar)="modo.set('editar')" />
  }
</app-modal>
```

Las pantallas que aún usan grises fijos se migran a estas clases cuando se modifiquen.

## 4. Convenciones de código (Angular 21)

- Componentes standalone con `ChangeDetectionStrategy.OnPush`. La app es **zoneless** (sin zone.js): el
  estado que cambia la vista se guarda en **signals**.
- `inject()` en vez de inyección por constructor; `input()`, `output()`, `model()` y `viewChild()` en vez
  de decoradores.
- Control de flujo `@if` / `@for` / `@let` en plantillas.
- Formularios reactivos tipados (`NonNullableFormBuilder`).
- Miembros usados solo por la plantilla: `protected`; dependencias: `private readonly`.
- Prohibido `any`; observables con `takeUntilDestroyed` o `toSignal`.
- No usar APIs marcadas `@experimental` (hoy: `resource`, `rxResource`, `httpResource`, Signal Forms).
- Selectores con prefijo `app-`.
- No relajar `strict` ni `strictTemplates`.
- No agregar dependencias sin una necesidad concreta.

## 5. Pendientes conocidos

- **Autenticación provisional:** `core/auth.ts` acepta cualquier usuario y contraseña no vacíos.
- **Modo local:** todas las pantallas de Personas, Operación y Finanzas funcionan con `localStorage`
  hasta que exista el API (cambiar `useClass` en `core/repositorios.ts`).
- **Envíos automáticos:** la programación de facturación solo guarda la configuración; el envío por
  WhatsApp/correo y su historial los debe hacer el servidor (`WhatsappService` apunta a
  `${apiUrl}/whatsapp/enviar.php`, que no existe aún).
- **Datos fijos:** el usuario de la barra superior y del saludo (`USUARIO_DEMO`) y Planes y Membresías siguen
  con datos de ejemplo. El inicio se calcula en el navegador (`TableroLocal`) hasta que exista `GET /tablero`.
- **Notificaciones:** se generan en el navegador (`NotificacionesLocal`) a partir de los datos locales;
  con API, el servidor debe crearlas con las mismas reglas y cambiar a `NotificacionesHttp`.
- **Soporte:** las solicitudes del Centro de Ayuda se guardan en `localStorage`
  (`SolicitudesSoporteService`) hasta que exista el API de soporte (envío, adjuntos, estado y respuesta).
