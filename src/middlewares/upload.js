const multer = require('multer');
const path = require('path');
const fs = require('fs');

const fotosDir = path.join(__dirname, '..', 'public', 'fotos');
if (!fs.existsSync(fotosDir)) {
  fs.mkdirSync(fotosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, fotosDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  }
});

const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes PNG o JPEG/JPG'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Middleware con manejo de errores
function uploadWithErrorHandler(fields) {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.render('agregar_foto', {
            errorMessage: '⚠️ La imagen supera el límite de 5 MB. Por favor, subí una más liviana.',
            detenido: {
              id_InternoLegajo: req.body.id_InternoLegajo,
              id_Persona: req.body.id_Persona
            }
          });
        }
        return res.render('agregar_foto', { errorMessage: '⚠️ Error al subir el archivo.' });
      } else if (err) {
        return res.render('agregar_foto', { errorMessage: '⚠️ Error inesperado al subir archivo.' });
      }
      next();
    });
  };
}

module.exports = { upload, uploadWithErrorHandler };



