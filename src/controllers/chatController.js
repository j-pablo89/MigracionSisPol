const chatService = require('../services/chatService');

module.exports = function (io) {
  io.use((socket, next) => {
    const session = socket.request.session;
    if (session && session.usuario) {
      socket.usuario = session.usuario;
      next();
    } else {
      next(new Error('No autenticado'));
    }
  });

  io.on('connection', (socket) => {
    const usuario = socket.usuario;

    socket.on('enviar_mensaje', async (contenido) => {
      if (!contenido?.trim()) return;
      const mensaje = await chatService.guardarMensaje(usuario, contenido.trim());
      io.emit('nuevo_mensaje', mensaje);
    });

    socket.on('disconnect', () => {});
  });
};