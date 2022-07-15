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
    .catch((err) => res.status(400).json(err));
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
exports.updateSauce = (req, res, next) => {
  // Si il y a un fichier
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        // Récupérer le nom de l'image à supprimer
        const filename = sauce.imageUrl.split('/images/')[1];
        // Supprimer l'image du serveur
        fs.unlink(`images/${filename}`, (err) => {
          if (err) throw err;
        });
      })
      .catch((err) => res.status(400).json({ err }));
  }
  // MAJ Base de données
  //
  // Opérateur ternaire ____ Si il y a un fichier MAJ
  const sauceObject = req.file
    ? {
        // Récupérer tout ce qu'il y a dans le req.body.sauce et mettre au format JSON
        ...JSON.parse(req.body.sauce),
        // Aller à la clé [ imageUrl ] et mettre le chemin complet de la nouvelle image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : // Sinon MAJ les données
      { ...req.body };
  // Mettre à jour la base de donnée
  // Récupérer l'id du produit et remplacer les nouvelles valeurs sur les anciennes
  console.log(req.body);
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: 'Produit modifier !' }))
    .catch((err) => res.status(400).json({ err }));
};

// Supprimer un produit
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Récupérer le nom de l'image à supprimer
      const filename = sauce.imageUrl.split('/images/')[1];

      // Supprimer l'image du serveur
      fs.unlink(`images/${filename}`, (err) => {
        if (err) throw err;
      });
    })
    .catch((err) => res.status(400).json({ err }));

  // Supprimer le produit de la base de données
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Produit supprimé !' }))
    .catch((err) => res.status(400).json({ err }));
};

exports.likeDislikeSauce = (req, res, next) => {
  // Récupérer le type de vote ( like ou dislike )

  // Chercher le produit dans la base de donnée
  Sauce.findOne({ _id: req.params.id })
    .then((product) => {
      switch (req.body.like) {
        case 1:
          // Mettre le like et l'userId dans le tableau usersLiked
          // Si l'utilisateur n'est pas présent dans le tableau usersLiked et que le like n'est pas égal à 1
          if (!product.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                // Incrémente +1 dans likes de la base de donnée
                $inc: { likes: 1 },
                // Ajoute l'userId de l'utilisateur au tableau usersLiked de la base de donnée
                $push: { usersLiked: req.body.userId },
              }
            )
              .then(() => res.status(200).json({ message: 'Like ajouté !' }))
              .catch((err) => res.status(500).json({ message: err }));
          }
          break;
        case -1:
          // Mettre le dislike et l'userId dans le tableau usersDisliked
          // Si l'utilisateur n'est pas présent dans le tableau usersDisliked et que le dislike n'est pas égal à -1
          if (!product.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                // Incrémente 1 dans dislikes de la base de donnée
                $inc: { dislikes: 1 },
                // Ajoute l'userId de l'utilisateur au tableau usersDisliked de la base de donnée
                $push: { usersDisliked: req.body.userId },
              }
            )
              .then(() => res.status(200).json({ message: 'Dislike ajouté !' }))
              .catch((err) => res.status(500).json({ message: err }));
          }
          break;
        case 0:
          // Enlever le like et l'userId dans le tableau usersLiked
          // Si l'utilisateur est présent dans le tableau usersLiked et que le like est égal à 0
          if (product.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                // Incrémente -1 dans likes de la base de donnée
                $inc: { likes: -1 },
                // Supprimer l'userId de l'utilisateur au tableau usersLiked de la base de donnée
                $pull: { usersLiked: req.body.userId },
              }
            )
              .then(() => res.status(200).json({ message: 'Like supprimer !' }))
              .catch((err) => res.status(500).json({ message: err }));
          }

          // Enlever le dislike et l'userId dans le tableau usersDisliked
          // Si l'utilisateur est présent dans le tableau usersDisliked et que le dislike est égal à 0
          if (product.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                // Incrémente -1 dans likes de la base de donnée
                $inc: { dislikes: -1 },
                // Supprimer l'userId de l'utilisateur au tableau usersDisliked de la base de donnée
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() =>
                res.status(200).json({ message: 'Dislike supprimer !' })
              )
              .catch((err) => res.status(500).json({ message: err }));
          }
          break;
      }
    })
    .catch((err) => res.status(400).json({ err }));
};
