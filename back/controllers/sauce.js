const Sauce = require('../models/sauce');
// Donne accès aux fonctions : Créer, Lire, Écrire, Copier, Renommer, Supprimer un fichier
const fs = require('fs');

// Afficher tous les produits de la base de données
exports.readAllSauces = async (req, res) => {
  try {
    const sauces = await Sauce.find().select('-__v');
    res.status(200).json(sauces);
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Afficher le produit sélectionné par l'utilisateur
exports.readOneSauce = async (req, res) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    res.status(200).json(sauce);
  } catch (err) {
    res.status(400).json({ err });
  }
};

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

// Modifier un produit
exports.updateSauce = async (req, res) => {
  try {
    if (req.file) {
      const sauce = await Sauce.findOne({ _id: req.params.id });
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
    const newSauce = await Sauce.findByIdAndUpdate(req.params.id, {
      ...sauceObject,
      _id: req.params.id,
    });
    res.status(200).json({ message: 'Produit modifier !', contenu: newSauce });
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Supprimer un produit
exports.deleteSauce = async (req, res) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, (err) => {
      if (err) throw err;
    });
    await Sauce.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Produit supprimé !' });
  } catch (err) {
    res.status(400).json({ err });
  }
};

// Liker un produit
exports.likeDislikeSauce = async (req, res) => {
  try {
    const product = await Sauce.findOne({ _id: req.params.id });
    switch (req.body.like) {
      case 1:
        if (!product.usersLiked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: req.body.userId },
            }
          );
          res.status(200).json({ message: 'Like ajouté !' });
        }
        break;
      case -1:
        if (!product.usersDisliked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: req.body.userId },
            }
          );
          res.status(200).json({ message: 'Dislike ajouté !' });
        }
        break;

      case 0:
        if (product.usersLiked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
            }
          );
          res.status(200).json({ message: 'Like supprimer !' });
        }
        if (product.usersDisliked.includes(req.body.userId)) {
          await Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
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
