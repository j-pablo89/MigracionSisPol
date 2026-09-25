require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mysql2 = require('mysql2');
const myConnection = require('express-myconnection');
const flash = require('connect-flash');
const session = require('express-session');
const verifyToken = require('./middlewares/authMiddleware');
const chatController = require('./controllers/chatController');
const http = require('http');
const { Server } = require('socket.io');


// IMPORTANDO RUTAS
const Routes = require('./routes/routes');

// SETTINGS (PUERTO A UTILIZAR, CARPETA DE VISTAS, ETC)
app.set('port', process.env.PORT || 5000); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES (FUNCIONES QUE SE EJECUTAN ANTES DE LAS PETICIONES DE LOS USUARIOS)
app.use(morgan('dev'));
app.use(myConnection(mysql2, {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    multipleStatements: true,
}, 'single'));
app.use(cookieParser());

app.use(session({
    secret: process.env.MI_CLAVE_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/ping', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ timeout: true });
  }
  res.sendStatus(200);
});

app.use(flash());

// MIDDLEWARE PARA SESION

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

//SWEET ALERT 2
app.use('/js', express.static(path.join(__dirname, '..', 'src', 'public', 'js')));
app.use('/sweetalert2', express.static(path.join(__dirname, '..', 'node_modules', 'sweetalert2', 'dist')));

app.use('/img', express.static(path.join(__dirname, '..', 'src', 'public', 'img')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES
app.use('/', Routes);

app.use("/Sispenal/fotos", express.static("\\\\10.0.0.10\\Sispenal\\Fotos"));

// ARCHIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, 'public')));

//MANEJO DEL ERROR 404
app.use((req, res) => {
    res.status(404).render('error404');
});
app.use((req, res) => {
    res.status(401).render('error401');
});

// SERVICIO DE CHAT
const server = http.createServer(app);
const io = new Server(server);
chatController(io);

// INICIANDO EL SERVIDOR
server.listen(app.get('port'), () => {
    console.log(`SERVER ON PORT ${app.get('port')}`);
});
