# RutaRola — Frontend

Sistema de gestión de transporte escolar (estudiantes, acudientes, empleados, finanzas, rutas y vehículos).
Construido con **Angular 21** (standalone, zoneless, signals), **Tailwind CSS 4** y **DaisyUI 5**.

## Comandos

```bash
npm install            # instalar dependencias
npm start              # servidor de desarrollo → http://localhost:4200 (con el API: cd ../api && docker compose up)
npm run start:local    # igual, pero todo en modo local (localStorage), sin API
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
  core/           auth.ts (sesión y roles), guardias.ts (guards por rol), whatsapp y repositorios.ts (fuente de datos de cada módulo)
  modulos.routes.ts  login + sistemas por tipo de usuario (con layout y guards), diferidos junto con los repositorios
  layout/         shell (administrativo), shell-conductor (ruta del día), shell-portal (acudiente), barra-superior, campana-notificaciones, menu-lateral
  ruta-del-dia/   app del conductor/monitora: rutas de hoy y recorrido paso a paso
  portal/         portal del acudiente: sus estudiantes, facturas, pagos y cotizaciones (solo lectura)
  shared/         piezas reutilizables (crud, modal, paginación, notificaciones, formularios, catálogos, fechas, exportar, pruebas)
  autenticacion/  login (+ AutenticacionRepositorio local/HTTP), registro, recuperar
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

### Backend (API)

El API está en `../api` (ASP.NET Core .NET 10 + PostgreSQL, multiempresa). Su documentación está en `api/README.md`.
Implementa los contratos que documenta cada `<plural>-http.ts`:

- recursos bajo `{apiUrl}` = `https://<host>/api/v1`;
- listados `{ items, total, pagina, tamano }` y `GET /x/opciones`;
- errores ProblemDetails con `mensaje`;
- enums en `UPPER_SNAKE`, fechas `YYYY-MM-DD`, horas `HH:mm` e ids UUID como texto.

Los módulos que ya tienen API se registran con `api(XRepositorio, XLocal, XHttp)` en `core/repositorios.ts`:
usan HTTP cuando `environment.usarApi` es `true` (desarrollo, `npm start`) y local con `npm run start:local`
(`environment.local.ts`), en producción mientras no se despliegue el API y en las pruebas
(`repositoriosDePrueba()` siempre es local). Para pasar otro módulo basta con cambiar su línea a `api(...)`.

- **Con API hoy:** colegios, vehículos, empleados, acudientes, estudiantes, la vista de conductores, rutas, asignaciones, la Ruta del día, el historial de recorridos y el login.
- `RepositorioHttp.motivoNoEliminar` consulta `GET /x/{id}/motivo-no-eliminar` → `{ motivo }` antes de pedir
  confirmación (el `DELETE` igual responde 409 con el mensaje).
- `listar` con `SIN_PAGINAR` trae como máximo 1000 registros por petición.
- Los textos opcionales vacíos viajan como `""` y una fecha opcional vacía también (`vencimientoLicencia` de una monitora).
- El contrato del empleado llega con `url` vacía en los listados; el detalle (`obtener`) trae el archivo.

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

### Tipos de usuario y acceso (`core/auth.ts`, `core/guardias.ts`, `autenticacion/`)
Cada tipo de usuario entra a SU sistema; el rol lo decide el servidor al iniciar sesión.

| Rol | Entra a | Ve |
|---|---|---|
| `ADMINISTRADOR` | `/inicio` | Sistema administrativo completo (menú lateral, todos los módulos) |
| `CONDUCTOR` / `MONITORA` | `/ruta-del-dia` | Solo la app de la ruta del día (layout `shell-conductor`, sin menú lateral) |
| `ACUDIENTE` | `/portal` | Solo el portal del acudiente (layout `shell-portal`): sus estudiantes, facturas, pagos y cotizaciones |

- `AutenticacionRepositorio` (`AutenticacionLocal` → `AutenticacionHttp`, `POST /auth/login` → `Sesion`)
  valida las credenciales; `AuthService` guarda la sesión (`rutarola.sesion`: `localStorage` con
  "Recordarme", si no `sessionStorage`). **Cerrar sesión borra solo la sesión**, nunca los datos.
- **Con API** (`AutenticacionHttp`): `POST {apiUrl}/auth/login` responde `{ sesion, tokens }`. Los tokens
  quedan dentro de la sesión (`Sesion.tokens`) y `interceptorAutenticacion` (`core/interceptor-autenticacion.ts`,
  registrado en `app.config.ts`) los usa así:
  - agrega `Authorization: Bearer <accessToken>` solo a las peticiones a `environment.apiUrl`, salvo
    `/auth/login`, `/auth/refresh` y `/auth/logout`;
  - ante un 401 renueva con `/auth/refresh` UNA sola vez para todas las peticiones que fallaron a la vez
    (`RenovacionSesion`), guarda los tokens nuevos donde estaba la sesión y repite cada petición;
  - si otra pestaña ya renovó, adopta sus tokens en lugar de reusar el refresh token viejo (el servidor
    trata ese reuso como robo y cierra todas las sesiones);
  - si la renovación falla, cierra la sesión y lleva a `/login?volver=<url>`.

  Cerrar sesión también revoca el refresh token (`POST /auth/logout`). En modo local no hay tokens y el
  interceptor no hace nada.
  `AutenticacionHttp` se usa junto con Personas (`api(...)`), porque los usuarios de conductores,
  monitoras y acudientes se crean desde sus formularios. El API crea su usuario con el rol de su tipo,
  cambiar la contraseña cierra sus sesiones y eliminar a la persona libera el usuario. Con los datos demo del
  API ingresan `jcardenas`, `ycharry`, `mperez`… con la clave `SEED_DEMO_PASSWORD`.
- **El login pide "Usuario"** (no correo): cada quien decide si es su correo, documento u otro texto.
- **Credenciales de empleados y acudientes:** los formularios de Personas › Empleados y Personas ›
  Acudientes tienen la sección "Acceso a la app" (`<app-campos-acceso>` y `controlesAcceso`/
  `contrasenasIguales`/`ajustarContrasena` de `personas/compartido/acceso.ts`) con usuario (obligatorio, único, 4–40 caracteres sin espacios, se guarda en minúsculas) y contraseña
  (obligatoria al crear, mínimo 6, con "Confirmar contraseña"; al editar, vacía = conservar la actual).
  La contraseña es de SOLO ESCRITURA: el API nunca la devuelve y debe guardarla con hash.
  **El usuario es único entre empleados, acudientes y el administrador** (409): cada repositorio local lo
  revisa contra el otro módulo en `validarRelaciones` (`validarUsuarioLibre`). Al eliminar el registro se
  libera su usuario.
- Login local: usuario + contraseña de un empleado → CONDUCTOR o MONITORA según su tipo; de un acudiente →
  ACUDIENTE (con `acudienteId` en la sesión); inactivo → no entra; `admin` / `rutarola` → ADMINISTRADOR. Error genérico "Usuario o contraseña incorrectos" (no se
  revela cuál falló). Las contraseñas locales viven aparte de los registros (`rutarola.credenciales`,
  `autenticacion/credenciales-local.ts`, `{usuario: {contrasena, titular: EMPLEADO|ACUDIENTE}}`); los
  empleados y acudientes de ejemplo usan inicial + apellido (`jcardenas`, `ycharry`, `mperez`…) con
  contraseña `rutarola`. La pantalla muestra un acceso de prueba por rol.
- Guards: `soloRoles(...)` en cada módulo (sin sesión → `/login?volver=<url>`; otro rol → la entrada de
  su sistema) y `soloInvitados` en el login. `volver` solo acepta rutas internas (`rutaInternaSegura`).
- El login vive en `modulos.routes.ts` (no en `app.routes.ts`) porque en modo local consulta empleados.
- La barra superior y el saludo del inicio muestran el usuario de la sesión.

### Ruta del día (`ruta-del-dia/`)
App para el celular del conductor y la monitora, dentro del vehículo.
- **Rutas de hoy:** las de sus asignaciones ACTIVAS vigentes en la fecha (`fechaInicio ≤ hoy ≤ fechaFin`)
  con ruta activa; muestra colegio, vehículo, número de estudiantes y el compañero (conductor ↔ monitora)
  con botón de llamar. El empleado sale de la sesión/token, nunca de un parámetro.
- **Trayectos:** `RECOGIDA` (casa → colegio, en el orden de la ruta) y `ENTREGA` (colegio → casa, en orden
  inverso). Un recorrido por asignación, fecha y trayecto; uno solo `EN_CURSO` por asignación. Conductor
  y monitora comparten el mismo recorrido: si uno toca "Iniciar" en un trayecto que el otro ya inició,
  **se une a ese recorrido** donde va (no es un error; aviso informativo) y "Mis rutas" se actualiza sola
  cuando el compañero inicia (`observarRutasDelDia`), mostrando "Continuar".
- **Snapshot:** al iniciar se guardan ruta, colegio, vehículo, personal y, por estudiante activo de la
  ruta, nombre, grado, dirección y acudiente con teléfono.
- **Estados por estudiante:** `PENDIENTE → A_BORDO → ENTREGADO` o `PENDIENTE → AUSENTE` ("No asistió"),
  con hora; "Deshacer" vuelve al estado anterior. Otras transiciones → 422.
- **Siguiente paso** (`siguientePaso`): recogida = recoger al siguiente pendiente y luego "Entregar en el
  colegio" a todos los que van a bordo; entrega = abordaje en el colegio y luego cada casa. Cada parada
  ofrece "Cómo llegar" (Google Maps), llamar y avisar por WhatsApp al acudiente.
- **Orden de visita (monitora):** durante el recorrido, la monitora arrastra a un estudiante que falta
  (manija ⠿, o ↑/↓ con botones o teclado) a otra posición: si el 2 pasa al 6, los del 3 al 6 suben una.
  Solo se reordenan los que faltan por visitar (recogida: PENDIENTES; entrega: PENDIENTES y A BORDO); los
  ya resueltos quedan arriba. Solo la monitora de la asignación (el conductor si la ruta no tiene
  monitora) — `puedeReordenar`; la lista enviada debe ser EXACTAMENTE la de los que faltan
  (`reordenarParadas`, si cambió mientras arrastraba → 409 y se recarga). Se guarda `ordenActualizado`
  (quién y cuándo). `PUT /recorridos/{id}/orden {estudianteIds}`.
- **Sincronización conductor ↔ monitora:** la pantalla del recorrido escucha los cambios del compañero
  (`observar`: en modo local, el evento `storage` de otra pestaña al instante; además consulta cada 10 s,
  como `RecorridosHttp` hasta que haya SSE/WebSocket). Si la monitora cambió el orden, el conductor ve el
  aviso "… cambió el orden · Ahora sigue: …" (con vibración) y el siguiente paso actualizado.
- **Finalizar** solo con todos ENTREGADOS o AUSENTES: **ningún estudiante puede quedar a bordo**.
  Un recorrido finalizado no se modifica. Si se cierra la app, el recorrido en curso se retoma desde "Mis rutas".
- **Historial** (Operación › Recorridos, solo lectura, administrador): todos los recorridos del más
  reciente al más antiguo, filtros por texto (ruta, colegio, placa, personal, estudiante), rango de fechas,
  ruta, trayecto, estado y novedad (con ausencias / con observaciones); detalle con la hora de cada
  estudiante y exportación CSV de todo lo filtrado. `HistorialRecorridosRepositorio`
  (`HistorialRecorridosLocal` → `HistorialRecorridosHttp`, `GET /recorridos`).
- `RecorridosRepositorio` (`RecorridosLocal`, `rutarola.recorridos` → `RecorridosHttp`, endpoints y
  códigos 409/422 documentados en la clase). Botones grandes, una sola acción principal (`btn-primary`)
  y sin toasts por cada marca (solo errores y el cierre).

### Portal del acudiente (`portal/`)
Para el celular del acudiente; **solo lectura** (no paga, no edita). El acudiente sale de la
sesión/token, nunca de un parámetro: solo ve SUS estudiantes, facturas, recibos y cotizaciones.
- `PortalRepositorio` (`PortalLocal` → `PortalHttp`, `GET /portal` → `PortalAcudiente`), estado
  compartido en `PortalEstado` (provisto en `portal.routes.ts`, botón "Actualizar" en el encabezado).
- Secciones (pestañas desde `sm`, barra inferior fija en celular): **Inicio** (saldo vencido, próximo
  pago, pagado en el año, "Hoy en la ruta" y últimos pagos), **Estudiantes** (colegio, horario, dirección
  de recogida, ruta, vehículo, conductor y monitora con llamada, estado de hoy), **Pagos** (facturas
  vigentes con cada mes, anuladas y recibos) y **Cotizaciones**.
- **Estado de cuenta** (`calcularEstadoCuenta`, puro; el API debe aplicar las mismas reglas): cada mes de
  una factura vigente es `PAGADA` (tiene recibo vigente), `VENCIDA` (pasó la fecha límite sin recibo),
  `PENDIENTE` (mes en curso dentro del plazo) o `PROGRAMADA` (mes futuro). La fecha límite es
  `fechaLimiteCuota` (`finanzas/reportes/reportes.ts`): día límite de la programación de la factura o el
  día 5. Las facturas anuladas no generan cuotas y los recibos anulados no cuentan. Próximo pago:
  primero lo vencido, luego lo pendiente y luego lo programado, por fecha.
- **Hoy en la ruta:** estado del recorrido de hoy por trayecto (`situacionRecorrido`): aún no inicia, la
  ruta va en camino, a bordo desde…, entregado…, no asistió.

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

- **Autenticación en modo local:** `AutenticacionLocal` guarda las contraseñas sin hash en el navegador (solo
  demo) y el administrador es fijo (`admin`). Con API (`npm start`) el login ya es `AutenticacionHttp`. Falta el
  módulo de usuarios administrativos.
  Datos locales creados antes de este cambio no tienen usuario: editar el empleado o limpiar los datos.
- **Modo mixto (desarrollo con API):** Personas, Operación (colegios, vehículos, rutas, asignaciones,
  conductores, Ruta del día e historial de recorridos), Finanzas (cotizaciones, facturas, recibos, programación
  y reportes) y el tablero de inicio vienen del API. Solo las notificaciones y el portal siguen calculándose en
  el navegador (leen los demás módulos por HTTP) hasta la fase 7. El
  Portal del acudiente no carga (lee estudiantes, que el acudiente no puede consultar) hasta que exista `GET /portal`.
  Para la demo completa sin API: `npm run start:local`.
- **Portal del acudiente:** se calcula en el navegador (`PortalLocal`) hasta que exista `GET /portal`.
- **Ruta del día:** con API los recorridos viven en el servidor (`RecorridosHttp`, sincronización por consulta
  cada 10 s); en modo local en `localStorage` (`RecorridosLocal`). Solo puede haber un recorrido en curso por
  asignación y día: uno que quedó abierto otro día no bloquea el de hoy. Falta que el servidor avise al
  acudiente (recogido, entregado, no asistió).
- **GPS y tiempo real:** el API ya recibe lotes de posiciones (`POST /recorridos/{id}/gps`), da la última
  posición y el trayecto, y emite `posicion`/`recorridoActualizado` por el hub SignalR `/hubs/recorridos`
  (contrato en `recorridos-http.ts`). Falta que la Ruta del día envíe la ubicación del teléfono, que la
  sincronización use el hub en vez de consultar cada 10 s y el mapa del administrador / del acudiente.
- **Programación de cobro:** el historial de envíos viene del API, pero los envíos automáticos (WhatsApp/correo)
  todavía no se hacen: los creará el proceso del servidor (fase 7).
- **Modo local:** las notificaciones, el portal y el Centro de Ayuda funcionan con `localStorage` hasta que exista su
  API (cambiar su línea a `api(...)` en `core/repositorios.ts`). En producción todo sigue local hasta desplegar
  el API (`environment.ts` → `usarApi: true`).
- **Envíos automáticos:** la programación de facturación solo guarda la configuración; el envío por
  WhatsApp/correo y su historial los debe hacer el servidor (`WhatsappService` apunta a
  `${apiUrl}/whatsapp/enviar.php`, que no existe aún).
- **Datos fijos:** el perfil del administrador local (`USUARIO_DEMO`) y Planes y Membresías siguen
  con datos de ejemplo. El inicio se calcula en el navegador (`TableroLocal`) hasta que exista `GET /tablero`.
- **Notificaciones:** se generan en el navegador (`NotificacionesLocal`) a partir de los datos locales;
  con API, el servidor debe crearlas con las mismas reglas y cambiar a `NotificacionesHttp`.
- **Soporte:** las solicitudes del Centro de Ayuda se guardan en `localStorage`
  (`SolicitudesSoporteService`) hasta que exista el API de soporte (envío, adjuntos, estado y respuesta).
