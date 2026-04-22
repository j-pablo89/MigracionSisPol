const express = require('express');
const router = express.Router();
const WebController = require('../controllers/WebController');
const verifyToken = require('../middlewares/authMiddleware');
const { uploadWithErrorHandler } = require('../middlewares/upload');
const { uploadFilesWithErrorHandler } = require('../middlewares/uploadfiles');

// ******************* CONTROL DE USUARIOS *************************
router.get('/inicio', verifyToken, WebController.inicio);
router.get('/api/ingresos/:anio', WebController.getIngresosPorAnio);
router.get('/usuarios', verifyToken, WebController.listarUsuarios);
router.get('/verificar_usuario/:dni', WebController.verificarUsuario);
router.get('/agregar_usuario', verifyToken, WebController.nuevoUsuario);
router.post('/guardar_usuario', verifyToken, WebController.guardarUsuario);
router.get('/acceso_usuario/:id', verifyToken, WebController.accesoUsuario);
router.post('/guardar_acceso', verifyToken, WebController.guardarAcceso);
router.post('/usuarios', verifyToken, WebController.limpiarClave);
router.get('/modificar_usuario/:id', WebController.modificarUsuario);
router.post('/actualizar_usuario/:id',verifyToken, WebController.actualizarUsuario);
router.get('/usuarios_conectados',verifyToken, WebController.conexionUsuarios);
router.get('/estadisticas',verifyToken, WebController.estadisticas);
router.post('/login', WebController.login);
router.get('/login', (req, res) => {
    const timeout = req.query.timeout || null;
    res.render('login', { timeout });
});
router.get('/', (req, res) => {
    res.render('login', { timeout: null });
});

router.get('/logout', verifyToken, WebController.logout);
router.get('/error401', (req, res) => {
    const error_msg = req.query.error || '';
    res.render('error401', { error_msg });
});
// ******************* CONTROL DE DETENIDOS ***************************
router.get('/detenidos', verifyToken, WebController.listarDetenidos);
router.get('/agregar_detenido', verifyToken, WebController.nuevoDetenido);
router.post('/guardar_detenido', verifyToken, WebController.guardarDetenido);
router.get('/modificar_detenido/:id', verifyToken, WebController.modificarDetenido);
router.post('/actualizar_detenido/:id', verifyToken, WebController.actualizarDetenido);
router.get('/causa_detenido/:id', verifyToken, WebController.causaDetenido);
router.post('/guardar_causa/:id', verifyToken, WebController.guardarCausaDetenido);
router.post('/actualizar_causa/:id', verifyToken, WebController.actualizarCausaDetenido);
router.post('/cerrar_causa/:id', verifyToken, WebController.cerrarCausaDetenido);
router.post('/reabrir_causa/:id', verifyToken, WebController.reabrirCausaDetenido);
router.post('/anular_causa/:id', verifyToken, WebController.anularCausaDetenido);
router.get('/agregar_foto/:id', verifyToken, WebController.agregarFoto);
router.post('/guardar_foto/:id',uploadWithErrorHandler([
    { name: 'frente', maxCount: 1 },
    { name: 'izquierdo', maxCount: 1 },
    { name: 'derecho', maxCount: 1 },
    { name: 'espalda', maxCount: 1 }
  ]),
  WebController.guardarFotos
);
router.get('/agregar_archivo/:id', verifyToken, WebController.agregarArchivo);
router.post('/guardar_archivo/:id', verifyToken,uploadFilesWithErrorHandler([{ name: 'archivo', maxCount: 1 }]),WebController.guardarArchivo);
router.post('/liberar_detenido/:id', verifyToken, WebController.liberarDetenido);
router.post('/mover_detenido/:id', verifyToken, WebController.moverDetenido);
router.post('/regresar_detenido/:id', verifyToken, WebController.regresarDetenido);
router.post('/trasladar_detenido/:id', verifyToken, WebController.trasladarDetenido);
router.post('/cambiar_clave/:id', verifyToken, WebController.cambiarClave);
router.get('/movimientos_comisarias', verifyToken, WebController.movimientosComisarias);
router.get('/movimientos_comisarias/exportar', verifyToken, WebController.exportarMovimientosComisarias);
router.get("/interleg", verifyToken, WebController.buscarInterleg);
router.get("/api/interleg/:dni", verifyToken, WebController.consultaDetenido);
// ===================== RUTAS API NOTIFICACIONES =====================
router.get('/api/notificaciones', verifyToken, WebController.obtenerNotificaciones);
router.post('/api/notificaciones/:id/responder', verifyToken, WebController.responderNotificacion);

module.exports = router;