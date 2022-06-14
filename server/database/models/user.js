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
	  User.belongsToMany(models.Semester, {through: models.Semester_User, foreignKey:'id'})
	  User.belongsTo(models.TA,{ foreignKey:'id'});
    }
  }
  User.init({
    email:{
		type: DataTypes.STRING,
		defaultValue: false,
		unique: true
	},
	fname:{
		type: DataTypes.STRING,
		defaultValue: false
	},
	lname:{
		type: DataTypes.STRING,
		defaultValue: false
	},
	access_token:{
		type: DataTypes.STRING,
		defaultValue: false
	},
	settings:{
		type: DataTypes.JSON,
		defaultValue: NULL
	},
  }, {
    sequelize,
    modelName: 'account',
  });
  return User;
};