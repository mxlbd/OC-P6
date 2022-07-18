require('dotenv');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupérer le token de l'utilisateur
    const token = req.headers.authorization.split(' ')[1];
    // Décoder le token de l'utilisateur [ .verify permet de vérifier la validité d'un token ]
    const decodedToken = jwt.verify(token, process.env.JWT);
    // Récupérer le userId du token décodé
    const userId = decodedToken.userId;
    // Ajouter cette valeur à l'objet req qui est transmit aux routes appelées
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' + error });
  }
};
