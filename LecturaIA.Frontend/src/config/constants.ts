export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const ROLES = {
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
  ADMIN: 'Administrador',
};

export const GRADOS = {
  CUARTO: 4,
  QUINTO: 5,
  SEXTO: 6,
};

export const TIMEOUTS = {
  LOGIN_REDIRECT_DELAY: 50,
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
};

export const UI_CONFIG = {
  MAX_SURVEY_SELECTIONS: 2,
  POLLING_INTERVAL_MS: 2000,
  POLLING_MAX_ATTEMPTS: 90, 
  DEBOUNCE_DELAY_MS: 500
};

export const DEFAULT_VALUES = {
  ESTUDIANTE_EDAD: 9,
  ESTUDIANTE_GRADO: 4,
};
