require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJs = require('crypto-js');

exports.signup = (req, res, next) => {
  const { email, password } = req.body;

  const emailCryptoJs = cryptoJs
    .HmacSHA256(email, process.env.EMAIL_SECRET)
    .toString();

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      const user = new User({
        email: emailCryptoJs,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  const emailCryptoJs = cryptoJs
    .HmacSHA256(email, process.env.EMAIL_SECRET)
    .toString();

  User.findOne({ email: emailCryptoJs })
    .then((user) => {
      if (user === null) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      } else {
        bcrypt
          .compare(password, user.password)
          .then((valid) => {
            if (!valid) {
              return res
                .status(401)
                .json({ error: 'Mot de passe incorrect !' });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  { userId: user._id },
                  process.env.TOKEN_SECRET,
                  {
                    expiresIn: '24h',
                  }
                ),
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
