const pool = require('../db'); // o como se llame tu conexión existente

async function guardarMensaje(usuario, contenido) {
  const [result] = await pool.query(
    'INSERT INTO chat_mensajes (usuario_id, contenido) VALUES (?, ?)',
    [usuario.id, contenido]
  );

  return {
    id: result.insertId,
    usuarioId: usuario.id,
    nombreUsuario: usuario.nombre,
    comisaria: usuario.comisaria_nombre,
    contenido,
    enviadoEn: new Date()
  };
}

async function obtenerHistorial(limite = 50) {
  const [mensajes] = await pool.query(
    `SELECT m.id, m.contenido, m.enviado_en, u.nombre AS nombreUsuario, u.comisaria_nombre
     FROM chat_mensajes m JOIN usuarios u ON u.id = m.usuario_id
     ORDER BY m.enviado_en DESC LIMIT ?`,
    [limite]
  );
  return mensajes.reverse();
}

module.exports = { guardarMensaje, obtenerHistorial };