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
        foreignKey: 'user_id'
      });
      Account.hasOne(models.ta, {foreignKey: 'ta_id'});
      Account.hasOne(models.student, {foreignKey: 'student_id'});
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
    fname: {
      type: DataTypes.STRING,
      defaultValue: false
    },
    lname: {
      type: DataTypes.STRING,
      defaultValue: false
    },
    access_token: {
      type: DataTypes.STRING,
      defaultValue: false
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: null
    },
  }, {
    sequelize,
    initialAutoIncrement: 1,
    modelName: 'account',
    tableName: 'account'
  });
  return Account;
};
