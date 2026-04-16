-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS pol_notificaciones (
    id_Notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuarios INT NOT NULL,
    id_InternoLegajo INT NOT NULL,
    id_Unidades INT NOT NULL,
    Apellido_Detenido VARCHAR(100),
    Nombre_Detenido VARCHAR(100),
    DNI_Detenido VARCHAR(20),
    Unidad_Origen VARCHAR(100),
    Unidad_Destino VARCHAR(100),
    Tipo_Notificacion VARCHAR(50),
    Estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aceptada, rechazada
    Fecha_Creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Fecha_Lectura DATETIME NULL,
    Leida BOOLEAN DEFAULT FALSE
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_usuario_notificaciones ON pol_notificaciones(id_Usuarios);
CREATE INDEX idx_estado_notificaciones ON pol_notificaciones(Estado);
CREATE INDEX idx_leida_notificaciones ON pol_notificaciones(Leida);
