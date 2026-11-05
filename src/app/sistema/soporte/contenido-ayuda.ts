import { OpcionCatalogo } from 'src/app/shared/catalogos/catalogos';
import { normalizar } from 'src/app/shared/formularios/formularios';
import { MENU_OPERATIVO, MENU_SISTEMA, OpcionMenu } from 'src/app/layout/menu-lateral/opciones-menu';

/**
 * Contenido del Centro de Ayuda: manuales, tutoriales y preguntas frecuentes.
 * Es el ÚNICO lugar donde se edita; las respuestas deben coincidir con las
 * rutas y reglas actuales de cada módulo (actualizarlas cuando un módulo cambie).
 */

export interface Manual {
  nombre: string;
  descripcion: string;
  icono: string;
  /** Ruta relativa a `public/`. */
  archivo: string;
}

export interface Tutorial {
  /** Id del video de YouTube. */
  videoId: string;
  titulo: string;
  descripcion: string;
  modulo: string;
}

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
  modulo: string;
}

export const MANUALES: Manual[] = [
  {
    nombre: 'Manual general',
    descripcion: 'Recorrido completo por RutaRola y sus módulos.',
    icono: 'fa-solid fa-book',
    archivo: 'documentacion/manual-general.pdf',
  },
  {
    nombre: 'Gestión de estudiantes',
    descripcion: 'Registro, colegio, curso y acudientes de cada estudiante.',
    icono: 'fa-solid fa-user-graduate',
    archivo: 'documentacion/estudiantes.pdf',
  },
  {
    nombre: 'Gestión de acudientes',
    descripcion: 'Datos de contacto y estudiantes a cargo.',
    icono: 'fa-solid fa-people-roof',
    archivo: 'documentacion/acudientes.pdf',
  },
  {
    nombre: 'Finanzas y facturas',
    descripcion: 'Cotizaciones, facturas mensuales y recibos de pago.',
    icono: 'fa-solid fa-file-invoice-dollar',
    archivo: 'documentacion/finanzas.pdf',
  },
  {
    nombre: 'Rutas y operación',
    descripcion: 'Colegios, rutas, vehículos y asignaciones.',
    icono: 'fa-solid fa-route',
    archivo: 'documentacion/rutas.pdf',
  },
  {
    nombre: 'Programación de facturación',
    descripcion: 'Recordatorios automáticos por WhatsApp y correo.',
    icono: 'fa-solid fa-calendar-days',
    archivo: 'documentacion/facturacion.pdf',
  },
];

export const TUTORIALES: Tutorial[] = [
  {
    videoId: 'iIgsCYgo5P4',
    titulo: 'Recorrido por RutaRola',
    descripcion: 'Conoce los módulos principales y cómo se conectan entre sí.',
    modulo: 'General',
  },
  {
    videoId: 'lAoj2JTQtbQ',
    titulo: 'Primeros pasos',
    descripcion: 'Configura tu cuenta y registra la información inicial.',
    modulo: 'General',
  },
  {
    videoId: 'Jd5BdGRMzk8',
    titulo: 'Registrar estudiantes',
    descripcion: 'Crea estudiantes, asígnales colegio, curso y acudiente.',
    modulo: 'Personas',
  },
  {
    videoId: 'Ls1cOqGf7oI',
    titulo: 'Crear facturas (contrataciones)',
    descripcion: 'Define el valor mensual y los meses del servicio por estudiante.',
    modulo: 'Finanzas',
  },
  {
    videoId: 'PEVztafebuk',
    titulo: 'Facturación automática',
    descripcion: 'Programa recordatorios de pago por WhatsApp y correo.',
    modulo: 'Finanzas',
  },
];

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    modulo: 'Personas',
    pregunta: '¿Cómo registro un estudiante?',
    respuesta:
      'En Personas › Estudiantes presiona "Nuevo estudiante". El curso se elige entre los cursos activos del colegio seleccionado, así que primero el colegio debe tener sus cursos creados en Operación › Colegios.',
  },
  {
    modulo: 'Finanzas',
    pregunta: '¿Cómo creo una contratación o factura?',
    respuesta:
      'En Finanzas › Facturas presiona "Nueva factura", elige el acudiente y el estudiante e indica el valor mensual con el mes inicial y final. Un estudiante no puede tener dos facturas vigentes que se crucen en los mismos meses.',
  },
  {
    modulo: 'Finanzas',
    pregunta: '¿Cómo registro un pago?',
    respuesta:
      'En Finanzas › Recibos crea un recibo para la factura y el mes que se paga. Cada mes de una factura solo se puede pagar una vez; si te equivocaste, anula el recibo y crea uno nuevo.',
  },
  {
    modulo: 'Finanzas',
    pregunta: '¿Cómo funcionan los recordatorios automáticos de cobro?',
    respuesta:
      'En Finanzas › Programación de facturación configura, por factura, el día límite de pago, cuántos días antes avisar y el mensaje "En uso" de cada canal (WhatsApp o correo). El envío lo hace el servidor y queda en el historial.',
  },
  {
    modulo: 'Operación',
    pregunta: '¿Cómo asigno un vehículo y un conductor a una ruta?',
    respuesta:
      'En Operación › Asignaciones elige la ruta, el vehículo, el conductor y la monitora. El conductor debe tener la licencia vigente y el vehículo debe estar activo, con cupo suficiente y documentos al día.',
  },
  {
    modulo: 'Operación',
    pregunta: '¿Cómo ven los conductores y monitoras su ruta del día?',
    respuesta:
      'Ingresan con el usuario y la contraseña que se les asigna al crearlos en Personas › Empleados (sección "Acceso a la app") y el sistema los lleva a "Ruta del día" (no ven los módulos administrativos). Allí aparecen las rutas de sus asignaciones activas y vigentes; inician la recogida (casa → colegio) o la entrega (colegio → casa) y marcan a cada estudiante como recogido, entregado o "No asistió". Un recorrido solo se finaliza cuando ningún estudiante queda a bordo. El administrador los consulta en Operación › Recorridos.',
  },
  {
    modulo: 'General',
    pregunta: '¿Por qué no puedo eliminar un registro?',
    respuesta:
      'Un registro que está en uso (por ejemplo, un acudiente con facturas o un vehículo asignado a una ruta) no se puede eliminar para no perder información. Cámbialo a estado Inactivo.',
  },
];

/** `true` si alguno de los textos contiene la búsqueda (sin tildes ni mayúsculas). */
export function coincideBusqueda(busqueda: string, ...textos: string[]): boolean {
  const buscado = normalizar(busqueda);
  return !buscado || textos.some((t) => normalizar(t).includes(buscado));
}

/** Pantallas del menú como opciones de "Módulo afectado" (se mantienen al día con el menú). */
export function modulosDelMenu(): OpcionCatalogo[] {
  const recorrer = (opciones: OpcionMenu[], prefijo: string[]): OpcionCatalogo[] =>
    opciones.flatMap((o) => {
      const camino = [...prefijo, o.etiqueta];
      return o.hijos ? recorrer(o.hijos, camino) : [{ id: camino.join(' › '), nombre: camino.join(' › ') }];
    });
  return [
    ...recorrer(MENU_OPERATIVO, []),
    ...recorrer(MENU_SISTEMA, ['Sistema']),
    { id: 'Otro', nombre: 'Otro / general' },
  ];
}
