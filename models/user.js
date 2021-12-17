'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.User, {
        through: models.ShareUser,
        foreignKey: 'shareUserId',
        as: "findUser"
      });
      User.belongsToMany(models.User, {
        through: models.ShareUser,
        foreignKey: 'userId',
        as: 'findShareUser',
      });
      User.belongsToMany(models.Category, {
        through: models.OwnCategory,
        foreignKey: 'userId',
        as: 'ownCategory',
      });
      User.hasMany(models.Payment)
   //   User.hasMany(models.Payment, { foreignKey: 'userId' })
    }
  };
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    shareUser: DataTypes.STRING,
    useTimes: DataTypes.INTEGER,
    lastIp: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    isLocked: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};