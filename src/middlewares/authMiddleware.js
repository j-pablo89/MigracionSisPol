const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

  // 🔓 Rutas públicas
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
    const timeLeft = decoded.exp - nowSeconds;

    // ⏱ Timeout por inactividad (10 min)
    const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

    if (!req.session.lastActivity) {
      req.session.lastActivity = nowMillis;
    }

    if (nowMillis - req.session.lastActivity > INACTIVITY_TIMEOUT) {
      req.session.destroy(() => {
        res.clearCookie('token');
        res.clearCookie('connect.sid');
        return res.redirect('/login?timeout=1');
      });
      return;
    }

    // 🔥 No contar polling de notificaciones como actividad
    if (!req.originalUrl.includes('/api/notificaciones')) {
      req.session.lastActivity = nowMillis;
    }

    // 🔄 Renovar token si está por expirar
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

    // 📌 Datos básicos disponibles en request
    req.user = {
      id: decoded.id,
      username: decoded.username
    };

    next();
  });
};

module.exports = verifyToken;