// Contenido de ayuda contextual por pantalla

export const contenidoAyuda = {
  // ESTUDIANTE
  estudianteDashboard: {
    titulo: 'Panel de Estudiante',
    instrucciones: [
      'En esta pantalla verás el resumen de tu progreso académico y tus lecturas recientes.',
      'Haz clic en "Nueva Lectura" para generar una lectura personalizada según tu nivel.',
      'Puedes ver tu clase actual y estadísticas de rendimiento en las tarjetas superiores.',
      'Desde el menú de tu perfil (arriba a la derecha) puedes cambiar tu contraseña o unirte a una clase.',
      'Las lecturas anteriores se muestran en la parte inferior con su estado y progreso.'
    ]
  },

  estudianteLectura: {
    titulo: 'Vista de Lectura',
    instrucciones: [
      'Lee el texto completo con atención, tómate tu tiempo.',
      'Puedes ajustar el tamaño del texto usando los controles si están disponibles.',
      'Una vez que termines de leer, haz clic en "Continuar al Cuestionario".',
      'El tiempo de lectura se registra automáticamente para tus estadísticas.',
      'Si necesitas pausar, puedes cerrar y volver más tarde (tu progreso se guarda).'
    ]
  },

  estudianteCuestionario: {
    titulo: 'Responder Cuestionario',
    instrucciones: [
      'Lee cada pregunta cuidadosamente antes de responder.',
      'Las preguntas pueden ser de tipo literal, analítico o crítico.',
      'Selecciona la respuesta que consideres correcta haciendo clic en ella.',
      'Puedes revisar y cambiar tus respuestas antes de enviar.',
      'Haz clic en "Enviar Respuestas" cuando hayas terminado todas las preguntas.'
    ]
  },

  estudianteResultados: {
    titulo: 'Resultados del Cuestionario',
    instrucciones: [
      'Aquí verás tu puntuación total y el desglose por tipo de pregunta.',
      'Revisa qué preguntas respondiste correcta e incorrectamente.',
      'Puedes ver la explicación de cada respuesta correcta.',
      'Analiza tus fortalezas y áreas de mejora en los diferentes tipos de comprensión.',
      'Haz clic en "Volver al Dashboard" para ver más lecturas o generar una nueva.'
    ]
  },

  // DOCENTE
  docenteDashboard: {
    titulo: 'Panel de Docente',
    instrucciones: [
      'Desde aquí puedes gestionar tus aulas y ver estadísticas generales.',
      'Haz clic en "Mis Aulas" para ver todas las clases que has creado.',
      'Puedes crear una nueva aula con el botón "Crear Aula Nueva".',
      'Las tarjetas superiores muestran resúmenes de estudiantes, aulas activas y lecturas generadas.',
      'Desde el menú de perfil puedes cambiar tu contraseña o cerrar sesión.'
    ]
  },

  docenteAulas: {
    titulo: 'Gestión de Aulas',
    instrucciones: [
      'Aquí verás todas tus aulas creadas con información de estudiantes.',
      'Cada aula tiene un código único de 6 caracteres para que los estudiantes se unan.',
      'Haz clic en "Ver Detalles" para acceder al aula y ver el progreso de tus estudiantes.',
      'Puedes crear nuevas aulas con el botón "+ Nueva Aula".',
      'Las aulas muestran el número de estudiantes activos y su actividad reciente.'
    ]
  },

  docenteAulaDetalle: {
    titulo: 'Detalle de Aula',
    instrucciones: [
      'Aquí ves la lista completa de estudiantes de esta aula.',
      'Puedes ver el progreso individual de cada estudiante haciendo clic en "Ver Métricas".',
      'El código de vinculación se muestra en la parte superior para compartir con nuevos estudiantes.',
      'Las estadísticas generales del salón se muestran en tarjetas (promedio, lecturas completadas, etc.).',
      'Usa los filtros y búsqueda para encontrar estudiantes específicos rápidamente.'
    ]
  },

  // ADMIN
  adminDashboard: {
    titulo: 'Panel de Administración',
    instrucciones: [
      'Gestiona usuarios, visualiza estadísticas globales del sistema.',
      'En "Estadísticas Generales" verás métricas clave de toda la plataforma.',
      'En "Gestión de Usuarios" puedes buscar, suspender, reactivar usuarios o reiniciar contraseñas.',
      'Usa la barra de búsqueda por email para encontrar usuarios específicos.',
      'Cada acción administrativa queda registrada con fecha y motivo.'
    ]
  }
};

// Pasos del tutorial por tipo de usuario

export const tutorialEstudiante = [
  {
    numero: 1,
    titulo: '¡Bienvenido a tu Dashboard! 📊',
    descripcion: 'Este es tu espacio personal. Aquí verás tu progreso, lecturas recientes y estadísticas. La tarjeta principal muestra información de tu clase actual y tu nivel de dificultad.'
  },
  {
    numero: 2,
    titulo: 'Generar Nueva Lectura 📚',
    descripcion: 'Haz clic en el botón "Nueva Lectura" para que el sistema genere un texto personalizado según tu nivel. Cada lectura viene con un cuestionario para evaluar tu comprensión.'
  },
  {
    numero: 3,
    titulo: 'Responder Cuestionarios ✍️',
    descripcion: 'Después de leer, responde el cuestionario. Las preguntas evalúan tres niveles: literal (datos del texto), analítico (inferencias) y crítico (opiniones y juicios). ¡Tómate tu tiempo!'
  },
  {
    numero: 4,
    titulo: 'Tu Perfil y Configuración ⚙️',
    descripcion: 'Desde el menú de tu nombre (arriba a la derecha) puedes ver tu perfil, unirte a una clase con el código de tu docente, cambiar tu contraseña y cerrar sesión.'
  }
];

export const tutorialDocente = [
  {
    numero: 1,
    titulo: '¡Bienvenido al Panel Docente! 👨‍🏫',
    descripcion: 'Desde aquí gestionas tus aulas y monitoreas el progreso de tus estudiantes. Las tarjetas superiores muestran resúmenes importantes de tu actividad docente.'
  },
  {
    numero: 2,
    titulo: 'Crear y Gestionar Aulas 🏫',
    descripcion: 'Haz clic en "Mis Aulas" para ver todas tus clases. Cada aula tiene un código único de 6 caracteres que compartes con tus estudiantes para que se unan.'
  },
  {
    numero: 3,
    titulo: 'Monitorear Estudiantes 📈',
    descripcion: 'Dentro de cada aula puedes ver métricas detalladas de cada estudiante: lecturas completadas, promedio de calificaciones, tipos de texto favoritos y más.'
  },
  {
    numero: 4,
    titulo: 'Análisis y Reportes 📊',
    descripcion: 'Usa las estadísticas para identificar fortalezas y áreas de mejora. Puedes ver el rendimiento por tipo de texto (narrativo, descriptivo, expositivo, etc.) y tipo de pregunta.'
  }
];

export const tutorialAdmin = [
  {
    numero: 1,
    titulo: 'Panel de Administración 🛡️',
    descripcion: 'Como administrador, tienes acceso completo al sistema. Puedes gestionar usuarios, ver estadísticas globales y mantener la plataforma funcionando correctamente.'
  },
  {
    numero: 2,
    titulo: 'Gestión de Usuarios 👥',
    descripcion: 'En la sección de usuarios puedes buscar por email, suspender cuentas con un motivo, reactivar usuarios suspendidos y reiniciar contraseñas cuando sea necesario.'
  },
  {
    numero: 3,
    titulo: 'Estadísticas del Sistema 📊',
    descripcion: 'Monitorea métricas clave: total de usuarios (estudiantes, docentes, admins), usuarios activos, lecturas generadas, cuestionarios completados y aulas activas.'
  },
  {
    numero: 4,
    titulo: 'Seguridad y Auditoría 🔒',
    descripcion: 'Todas las acciones administrativas quedan registradas con fecha, hora y motivo. Revisa regularmente las actividades sospechosas y mantén la plataforma segura.'
  }
];
