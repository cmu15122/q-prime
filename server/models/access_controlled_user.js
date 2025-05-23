'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Access_Controlled_User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Access_Controlled_User.belongsTo(models.semester, {
        foreignKey: 'sem_id'
      });
    }
  }
  Access_Controlled_User.init({
    // not tied to account as this can be defined before account is created by admins
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sem_id:{
      type: DataTypes.STRING(3),
      allowNull: false
    },
    is_whitelisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_blacklisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'access_controlled_user',
    tableName: 'access_controlled_user'
  });
  return Access_Controlled_User;
};
