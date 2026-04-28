const puedeModificarUsuario = (req, res, next) => {
  const usuarioLogueado = req.session.usuario;

  if (!usuarioLogueado) {
    return res.redirect('/login');
  }

  const rolViewer = usuarioLogueado.nombre_rol;
  const idObjetivo = req.params.id;

  const esUsuarioComun = (rol) =>
    ['USUARIO', 'USUARIO GENERAL', 'SIN PERFIL'].includes(rol);

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send(err);

    conn.query("SELECT nombre_rol FROM usuarios WHERE id_usuario = ?", [idObjetivo], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send("Usuario no encontrado");

        const rolObjetivo = result[0].nombre_rol;

        let permitido = false;

        if (rolViewer === 'SUPERADMIN') {
          permitido = rolObjetivo !== 'SUPERADMIN';
        } else if (rolViewer === 'ADMINISTRADOR') {
          permitido = esUsuarioComun(rolObjetivo);
        }

        if (!permitido) {
          return res.status(403).send("No tenés permisos para esta acción");
        }

        next();
      }
    );
  });
};

module.exports = { puedeModificarUsuario };