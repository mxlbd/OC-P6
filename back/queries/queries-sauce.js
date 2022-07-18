const Sauce = require('../models/sauce');

exports.findSauce = (select) => {
  return Sauce.find().select(select);
};

exports.findByIdSauce = (id, select, exec) => {
  return Sauce.findById({ _id: id }).select(select).exec(exec);
};

exports.findByIdAndDeleteSauce = (id, exec) => {
  return Sauce.findByIdAndDelete({ _id: id }).exec(exec);
};
