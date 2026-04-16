const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpeta public/archivos si no existe
const filesDir = path.join(__dirname, '..', 'public', 'archivos');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}
// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filesDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  }
});
// Tipos de archivos permitidos
const allowedMimes = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];
// Configuración base
const baseConfig = {
  storage,
  fileFilter: (req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('⚠️ Solo se permiten PDF, DOC, DOCX, XLS, XLSX'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB por archivo
};
const upload = multer(baseConfig);
// Middleware con manejo de errores
function uploadFilesWithErrorHandler(fields) {
  const uploadHandler = multer(baseConfig).fields(fields);

  return (req, res, next) => {
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error("Error en subida:", err);

        // Capturamos el id para volver al formulario correcto
        const internoId = req.params.id || (req.body && req.body.id_InternoLegajo);

        // ⚠️ Usamos redirect en vez de render
        return res.redirect(`/agregar_archivo/${internoId}?error=1`);
      }
      next();
    });
  };
}
module.exports = { upload, uploadFilesWithErrorHandler };

