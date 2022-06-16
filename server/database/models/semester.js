'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Semester extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ 
    static associate(models) {
      // define association here
      Semester.belongsToMany(models.assignment, {
        through: models.assignment_semester,
        foreignKey: "sem_id"
      });
      Semester.belongsToMany(models.account, {
        through: models.semester_user,
        foreignKey: "sem_id"
      });
      Semester.belongsToMany(models.question, {
        through: "sem_id",
        foreignKey: "sem_id"
      })
    }
  }
  Semester.init({
    sem_id:{
      type: DataTypes.STRING(3),
      unique: true,
      defaultValue: false,
      primaryKey: true
    },
  }, {
    sequelize,
    modelName: 'semester',
    tableName: 'semester'
  });
  return Semester;
};