const pool = require('../config/db');

async function guardarMensaje(usuario, contenido) {
  const [result] = await pool.query(
    'INSERT INTO pol_chat_mensajes (id_usuario, Contenido) VALUES (?, ?)',
    [usuario.id, contenido]
  );

  return {
    id: result.insertId,
    usuarioId: usuario.id,
    nombreUsuario: usuario.nombre,
    contenido,
    enviadoEn: new Date()
  };
}

async function obtenerHistorial(limite = 50) {
  const [mensajes] = await pool.query(
    `SELECT m.id_Mensaje AS id, m.Contenido AS contenido, m.Fecha_Creacion AS enviadoEn,
            m.id_usuario AS usuarioId, CONCAT(p.Nombre, ' ', p.Apellido) AS nombreUsuario
     FROM pol_chat_mensajes m
     INNER JOIN pol_usuarios u ON u.id_usuario = m.id_usuario
     INNER JOIN pol_persona p ON p.id_Persona = u.id_Persona
     ORDER BY m.Fecha_Creacion DESC LIMIT ?`,
    [limite]
  );
  return mensajes.reverse();
}

module.exports = { guardarMensaje, obtenerHistorial };