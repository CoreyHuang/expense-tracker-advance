'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.Category);
      Payment.belongsTo(models.User);
      
    }
  };
  Payment.init({
    categoryId: DataTypes.STRING,
    price: DataTypes.INTEGER,
    userId: DataTypes.STRING,
    shareUserId: DataTypes.STRING,
    isShare: DataTypes.BOOLEAN,
    isShareCheck: DataTypes.BOOLEAN,
    isSendBack: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};