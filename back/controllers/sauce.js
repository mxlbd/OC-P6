const Sauce = require('../models/sauce');
// Donne accès aux fonctions : Créer, Lire, Écrire, Copier, Renommer, Supprimer un fichier
const fs = require('fs');

const {
  findSauce,
  findByIdSauce,
  findByIdAndDeleteSauce,
} = require('../queries/queries-sauce');

// Créer un produit
exports.createSauce = async (req, res) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`,
      likes: 0,
      dislikes: 0,
      usersLiked: [''],
      usersDisliked: [''],
    });
    const newSauce = await sauce.save();
    res.status(201).json({ message: newSauce });
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Afficher tous les produits de la base de données
exports.getAllSauces = async (req, res) => {
  try {
    const sauces = await findSauce('-__v');
    res.status(200).json(sauces);
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Afficher le produit sélectionné par l'utilisateur
exports.getOneSauce = async (req, res) => {
  try {
    const sauce = await findByIdSauce(req.params.id, '-__v');
    res.status(200).json(sauce);
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Modifier un produit
exports.updateSauce = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.file) {
      const sauce = await findByIdSauce(id, '-__v');
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) throw err;
      });
    }
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    const newSauce = await Sauce.findByIdAndUpdate(id, {
      ...sauceObject,
      _id: id,
    });
    res.status(200).json({ message: 'Produit modifier !', contenu: newSauce });
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Supprimer un produit
exports.deleteSauce = async (req, res) => {
  try {
    const { id } = req.params;

    const sauce = await findByIdSauce(id, '-__v');
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, (err) => {
      if (err) throw err;
    });
    await findByIdAndDeleteSauce(id);
    res.status(200).json({ message: 'Produit supprimé !' });
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Liker un produit
exports.likeDislikeSauce = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, like } = req.body;

    const product = await findByIdSauce(id, '-__v');
    switch (like) {
      case 1:
        if (!product.usersLiked.includes(userId)) {
          await Sauce.findByIdAndUpdate(
            { _id: id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: userId },
            }
          );
          res.status(200).json({ message: 'Like ajouté !' });
        }
        break;
      case -1:
        if (!product.usersDisliked.includes(userId)) {
          await Sauce.findByIdAndUpdate(
            { _id: id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: userId },
            }
          );
          res.status(200).json({ message: 'Dislike ajouté !' });
        }
        break;

      case 0:
        if (product.usersLiked.includes(userId)) {
          await Sauce.findByIdAndUpdate(
            { _id: id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: userId },
            }
          );
          res.status(200).json({ message: 'Like supprimer !' });
        }
        if (product.usersDisliked.includes(userId)) {
          await Sauce.findByIdAndUpdate(
            { _id: id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: userId },
            }
          );
          res.status(200).json({ message: 'Dislike supprimer !' });
        }
        break;
    }
  } catch (err) {
    res.status(400).json({ err });
  }
};
