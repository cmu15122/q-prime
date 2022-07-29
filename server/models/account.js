'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.hasMany(models.semester_user, {
        foreignKey: 'user_id',
        as: 'semester_users'
      });
      Account.hasOne(models.ta, {
        foreignKey: 'ta_id',
        as: 'ta'
      });
      Account.hasOne(models.student, {
        foreignKey: 'student_id',
        as: 'student'
      });
    }
  }
  Account.init({
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: false
    },
    preferred_name: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    access_token: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
  }, {
    sequelize,
    initialAutoIncrement: 1,
    modelName: 'account',
    tableName: 'account'
  });
  return Account;
};
