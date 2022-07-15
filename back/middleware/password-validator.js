const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

passwordSchema
  // Minimum 8 caractères
  .is()
  .min(8)
  // Maximium 100 caractères
  .is()
  .max(100)
  // Au moins 1 majuscule
  .has()
  .uppercase()
  // Au moins 1 minuscule
  .has()
  .lowercase()
  // Au moins 2 chiffres
  .has()
  .digits(2)
  // Pas d'espace
  .has()
  .not()
  .spaces();

module.exports = (req, res, next) => {
  if (passwordSchema.validate(req.body.password)) {
    next();
  } else {
    res.status(401).json({
      error:
        'Le mot de passe est trop faible : ' +
        passwordSchema.validate(req.body.password, { list: true }),
    });
  }
};
