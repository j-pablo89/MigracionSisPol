const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const verifyToken = (req, res, next) => {

  // 🔓 Rutas públicas (NO proteger)
  const publicRoutes = ['/login', '/logout'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    const nowMillis = Date.now();
    const nowSeconds = Math.floor(nowMillis / 1000);

    // ⏳ Validar expiración del token
    const timeLeft = decoded.exp - nowSeconds;

    // ⏱ Timeout por inactividad (10 min)
    const INACTIVITY_TIMEOUT = 1 * 60 * 1000;

    if (!req.session.lastActivity) {
      req.session.lastActivity = nowMillis;
    }

    const lastActivity = req.session.lastActivity;

    if (nowMillis - lastActivity > INACTIVITY_TIMEOUT) {

      const userId = req.session.userId;

      if (userId) {

        const conn = mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME
        });

        conn.query(
          'INSERT INTO pol_logueo (id_usuario, Tipo, FechaHoraSesion) VALUES (?, ?, NOW())',
          [userId, 'LOGOUT INACTIVIDAD'],
          () => {
            conn.end();
            req.session.destroy(() => {
              res.clearCookie('token');
              res.clearCookie('connect.sid');
              return res.redirect('/login?timeout=1');
            });
          }
        );

      } else {
        res.clearCookie('token');
        return res.redirect('/login');
      }

      return;
    }

    // 🔄 No contar polling como actividad
    if (!req.originalUrl.includes('/api/notificaciones')) {
      req.session.lastActivity = nowMillis;
    }

    // 🔁 Renovar token si faltan menos de 10 min
    if (timeLeft < 10 * 60) {
      const newToken = jwt.sign(
        { id: decoded.id, username: decoded.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('token', newToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    // 📌 Setear datos en request
    req.userId = decoded.id;
    req.username = decoded.username;
    req.user = {
      id: decoded.id,
      username: decoded.username
    };

    // 🧠 Si falta info en sesión, cargarla
    if (!req.session.avatar || !req.session.username || !req.session.perfil) {

      const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
      });

      conn.query(
        `SELECT id_usuario, Usuario, Contrasenia, Email, Telefono, Nombre, Apellido, Dni, Avatar_url, permiso_principal AS Permiso, nombre_rol
        FROM pol_usuarios 
        INNER JOIN pol_persona USING(id_Persona) 
        INNER JOIN pol_usuarioperfiles USING(id_usuario)
        INNER JOIN pol_roles USING(id_rol)
        WHERE Usuario = ? AND pol_usuarios.Estado = 1`,
        [decoded.username],
        (err, results) => {

          if (!err && results.length > 0) {

            const user = results[0];

            req.session.userId = decoded.id;
            req.session.username = user.Nombre + ' ' + user.Apellido;
            req.session.avatar = user.Avatar_url;
            req.session.permiso = user.Permiso;
            req.session.nombre_rol = user.nombre_rol;
            req.session.dni = user.Dni;

            req.session.save(() => {
              conn.end();
              next();
            });

          } else {
            conn.end();
            next();
          }
        }
      );

    } else {
      next();
    }

  });
};

module.exports = verifyToken;


