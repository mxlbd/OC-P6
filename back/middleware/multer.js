const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Objet [ storage ] de configuration pour multer
const storage = multer.diskStorage({
  // Indique à multer d'enregistrer les fichiers dans le dossier images
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(' ').join('-');
    // Utilise la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée
    const extension = MIME_TYPES[file.mimetype];
    // Indique à multer d'utiliser le nom d'origine,
    // de remplacer les espaces par des underscores et
    // d'ajouter un timestamp comme nom de fichier
    cb(null, name + Date.now() + '.', extension);
  },
});

// Exporte multer entièrement configurer avec la constante [ storage ],
// Indique que nous générons uniqument des téléchargements d'image
module.exports = multer({ storage }).single('image');
