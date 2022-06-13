'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Assignments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
	  Assignments.belongsToMany(models.Semesters, {through: models.Assignment_Semester, foreignKey:'id'});
    }
  }
  Assignments.init({
    name: DataTypes.STRING,
    category: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Assignments',
  });
  return Assignments;
};