const Sauce = require('../models/sauce');
// Donne accès aux fonctions : Créer, Lire, Écrire, Copier, Renommer, Supprimer un fichier
const fs = require('fs');

// Afficher tous les produits de la base de données
exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((err) => res.status(400).json(err));
};

// Afficher le produit sélectionné par l'utilisateur
exports.readOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((err) => res.status(404).json(err));
};

// Créer un produit
exports.createSauce = (req, res, next) => {
  // Utiliser [ JSON.parse() ] pour obtenir un objet utilisable
  const sauceObject = JSON.parse(req.body.sauce);

  // L'id du produit sera généré par la base de données
  delete sauceObject._id;

  // Supprimer le champ userId car ne pas faire confiance au client
  // Il sera remplacer le userId extrait du token
  delete sauceObject._userId;

  const sauce = new Sauce({
    // Tableau à envoyé à la base de donnée pour créer un nouvelle sauce
    ...sauceObject,
    // userId extrait du token par le middleware [ auth ]
    userId: req.auth.userId,
    // utiler [ req.protocol ] pour obtenir le premier segment ( http )
    // On ajoute ( :// )
    // Utiliser [ req.get('host') ] pour résoudre l'hôte du serveur ( 'localhost:3000' )
    // On ajoute ( /images/ ) et le nom de fichier pour compléter l'URL

    // Exemple : http://localhost:3000/images/<image-name>.jpg
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,

    likes: 0,
    dislikes: 0,
    usersLiked: [''],
    usersDisliked: [''],
  });
  // Sauvegarde dans la base de données toutes les informations saisies par le client
  sauce
    .save()
    .then((sauce) => res.status(201).json({ message: sauce }))
    .catch((err) => res.status(400).json({ err }));
};

// Modifier un produit
exports.updateSauce = (req, res, next) => {};

// Supprimer un produit
exports.deleteSauce = (req, res, next) => {};

exports.likeDislikeSauce = (req, res, next) => {
  // Liker un produit
  // DisLiker un produit
};
