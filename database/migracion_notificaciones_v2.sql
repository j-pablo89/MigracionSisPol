-- Agregar campos de traslado a la tabla de notificaciones
ALTER TABLE pol_notificaciones ADD COLUMN id_Persona INT AFTER id_InternoLegajo;
ALTER TABLE pol_notificaciones ADD COLUMN id_InternoProntuario INT AFTER id_Persona;
ALTER TABLE pol_notificaciones ADD COLUMN Unidad_Dependencia INT AFTER id_InternoProntuario;
ALTER TABLE pol_notificaciones ADD COLUMN Unidad_Alojado INT AFTER Unidad_Dependencia;
ALTER TABLE pol_notificaciones ADD COLUMN Movil VARCHAR(100) AFTER Unidad_Alojado;
ALTER TABLE pol_notificaciones ADD COLUMN PersonalCustodio VARCHAR(100) AFTER Movil;
ALTER TABLE pol_notificaciones ADD COLUMN Observaciones TEXT AFTER PersonalCustodio;
ALTER TABLE pol_notificaciones ADD COLUMN id_InternoMovimiento INT AFTER Observaciones;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_detenido_notificaciones ON pol_notificaciones(id_InternoLegajo);
