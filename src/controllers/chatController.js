const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const chatService = require('../services/chatService');

module.exports = function (io) {
  // Autenticar el socket con el mismo JWT que usa verifyToken en las rutas HTTP
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.token;
      if (!token) return next(new Error('No autenticado'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.usuario = {
        id: decoded.id,
        username: decoded.username,
        nombre: `${decoded.nombre} ${decoded.apellido}`,
        nombre_rol: decoded.nombre_rol,
      };
      next();
    } catch (err) {
      next(new Error('No autenticado'));
    }
  });

  io.on('connection', (socket) => {
    const usuario = socket.usuario;

    socket.on('enviar_mensaje', async (contenido) => {
      if (!contenido?.trim()) return;
      try {
        const mensaje = await chatService.guardarMensaje(usuario, contenido.trim());
        io.emit('nuevo_mensaje', mensaje);
      } catch (err) {
        console.error('Error al guardar mensaje de chat:', err);
      }
    });

    socket.on('disconnect', () => {});
  });
};