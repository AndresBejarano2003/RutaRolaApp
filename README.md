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
  core/           servicios globales (auth, whatsapp)
  layout/         shell, barra-superior, menu-lateral (opciones-menu.ts)
  shared/         piezas reutilizables (crud, modal, paginación, notificaciones, formularios, catálogos)
  autenticacion/  login, registro, recuperar
  inicio/         dashboard, perfil, configuración
  personas/  finanzas/  operacion/  sistema/     una carpeta por pantalla + <modulo>.routes.ts
```

**Agregar una pantalla:**
1. Crear `<modulo>/<nombre>/<nombre>-page.ts` y `.html`.
2. Registrar la ruta en `<modulo>/<modulo>.routes.ts` con su `data.breadcrumb`.
3. Agregar la opción en `layout/menu-lateral/opciones-menu.ts`.
4. Mientras no tenga contenido, la ruta apunta a `shared/en-construccion`.

## 2. Estructura de toda pantalla CRUD

Toda pantalla de registros (estudiantes, acudientes, empleados, colegios, vehículos, cotizaciones…)
tiene **filtros, listado paginado y una ventana modal para registrar, modificar y consultar**, más
confirmación para eliminar. La implementación de referencia es **`personas/estudiantes/`**.

| Archivo | Responsabilidad |
|---|---|
| `<entidad>.ts` | Modelo (extiende `Entidad`), interfaz de filtros y filtros vacíos |
| `<plural>-repositorio.ts` | Contrato abstracto de acceso a datos (token de inyección) |
| `<plural>-local.ts` | Almacenamiento **temporal** en el navegador (`localStorage`) con datos de ejemplo y validaciones de negocio |
| `<plural>-http.ts` | Conexión al API REST, lista para usar |
| `<plural>-store.ts` | Estado de la pantalla con signals: listado, filtros, paginación, cargando, guardando, errores |
| `<plural>-filtros/` | Filtros con búsqueda en vivo y botón **Limpiar** |
| `<plural>-tabla/` | Listado con acciones **Consultar / Editar / Eliminar** |
| `<entidad>-formulario/` | **Solo los campos** del formulario, con modos **crear / editar / consultar** (solo lectura) y validaciones |
| `<plural>-page.ts` | Orquesta todo; usa `app-modal`, `app-acciones-formulario`, `app-dialogo-confirmacion` y `app-paginacion` |

Comportamiento obligatorio:
- Clic en una fila = **consultar**. Desde la consulta se puede pasar a **editar**.
- **Eliminar** siempre pide confirmación.
- Al guardar, eliminar o fallar se muestra una **notificación** (toast).
- Mientras se guarda, los botones se deshabilitan y muestran un spinner.
- Los campos obligatorios se marcan con `*` y cada error se explica debajo del campo.
- Listado vacío: mensaje claro (y botón de crear si no hay filtros activos).

### Datos temporales y conexión al API

Mientras no exista el backend, los registros se guardan en `localStorage` (clave `rutarola.<recurso>`) y la
pantalla muestra el indicador **"Modo local"**. Para conectar el API se cambia **una línea** en las rutas
del módulo:

```ts
providers: [{ provide: EstudiantesRepositorio, useClass: EstudiantesLocal }]   // hoy
providers: [{ provide: EstudiantesRepositorio, useClass: EstudiantesHttp }]    // con API
```

Contrato REST que espera `RepositorioHttp` (`environment.apiUrl`):

| Operación | Petición | Respuesta |
|---|---|---|
| Listar | `GET /{recurso}?pagina=1&tamano=10&<filtros>` | `{ items, total, pagina, tamano }` |
| Consultar | `GET /{recurso}/{id}` | registro |
| Crear | `POST /{recurso}` | registro creado |
| Modificar | `PUT /{recurso}/{id}` | registro actualizado |
| Eliminar | `DELETE /{recurso}/{id}` | vacío |

Errores: el API puede responder `{ "mensaje": "..." }` y se mostrará tal cual; si no, se usa un mensaje
según el código (409 = duplicado, 404 = no existe, 0 = sin conexión…).

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
  - contenedor `overflow-x-auto rounded-box border border-base-300`;
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

  ```html
  <!-- Filtro -->
  <app-selector-busqueda formControlName="colegioId" [opciones]="catalogos.colegios()"
    textoTodos="Todos los colegios" etiqueta="Colegio" />

  <!-- Formulario -->
  <div class="flex flex-col w-full">
    <span class="label-text text-base-content/90 mb-1">Colegio <span class="text-error">*</span></span>
    <app-selector-busqueda formControlName="colegioId" [opciones]="catalogos.colegios()"
      etiqueta="Colegio" [invalido]="!!error('colegioId')" />
  </div>
  ```
- **Paginación:** siempre `<app-paginacion>`: números de página, la actual en amarillo (`btn-primary`),
  "Mostrando a–b de n" y selector de filas por página (10/25/50).
- **Modal:** `<app-modal>`; eliminar con `<app-dialogo-confirmacion>`. Ver la regla de modales abajo.
- **Botón principal:** `btn btn-primary` (amarillo con texto oscuro).

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
- **Catálogos de ejemplo:** colegios y acudientes en `shared/catalogos` son de ejemplo hasta tener sus APIs.
- **Datos fijos:** el dashboard y las demás pantallas (excepto estudiantes) muestran datos fijos.
