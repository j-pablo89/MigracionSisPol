const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    console.log('Roles permitidos para esta ruta:', rolesPermitidos);
    console.log('ROL: ', req.session.usuario);
    if (!req.session.usuario) {
      return res.redirect('/login');
    }
    const rol = req.session.usuario.nombre_rol;
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).send('No tenés permisos');
    }
    console.log('ROL autorizado para acceder a la ruta');
    next();
  };
};

module.exports = { checkRole };