const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const verifyToken = (req, res, next) => {
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
    
    const INACTIVITY_TIMEOUT = 10 * 60 * 1000;
    if (!req.session.lastActivity) {
      req.session.lastActivity = nowMillis;
    }
    const lastActivity = req.session.lastActivity;
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    });
    if (nowMillis - lastActivity > INACTIVITY_TIMEOUT) {
      const userId = req.session.userId;
      if (userId) {
        pool.query(
          'INSERT INTO pol_logueo (id_usuario, Tipo) VALUES (?, ?)',
          [userId, 'LOGOUT INACTIVIDAD'],
          () => {
            req.session.destroy(() => {
              res.clearCookie('token');
              res.clearCookie('connect.sid');
              return res.redirect('/login?timeout=1');
            });
          }
        );
        return; // 👈 IMPORTANTE
      }
      res.clearCookie('token');
      return res.redirect('/login');
    }
    if (!req.originalUrl.includes('/api/notificaciones') && !req.originalUrl.includes('/ping')) {
      req.session.lastActivity = nowMillis;
    }
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
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    next();
  });
};

module.exports = verifyToken;