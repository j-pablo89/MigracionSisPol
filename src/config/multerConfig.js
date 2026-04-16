const multer = require('multer');
const path = require('path');

// Configuración de Multer para almacenar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Guardar imágenes en la carpeta 'uploads/images' y PDFs en 'uploads/pdf'
    if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
      cb(null, 'src/Public/uploads/images'); // Carpeta de imágenes
    } else if (fileExtension === '.pdf') {
      cb(null, 'src/Public/uploads/pdf'); // Carpeta de PDFs
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Nombre único para cada archivo
  }
});

// Filtro para permitir solo imágenes y PDFs
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: Solo se permiten imágenes y PDFs!'), false);
};

// Middleware Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Límite de tamaño: 5MB por archivo
});

// Exporta correctamente el middleware
module.exports = upload;

