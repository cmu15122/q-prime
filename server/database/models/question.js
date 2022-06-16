'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.hasMany(models.semester, {foreignKey: 'sem_id'});
      Question.hasMany(models.student, {foreignKey: 'student_id'});
      Question.hasMany(models.ta, {foreignKey: 'ta_id'});
    }
  }
  Question.init({
    student_id:{
      type: DataTypes.INTEGER,
      references:{
        model: 'student',
        key: 'student_id'
      }
    },
    ta_id:{
      type: DataTypes.INTEGER,
      references:{
        model: 'ta',
        key: 'ta_id'
      }
    },
    sem_id:{
      type: DataTypes.STRING,
      references:{
        model: 'semester',
        key: 'sem_id'
      }
    },
    question: DataTypes.TEXT,
    attempted: DataTypes.TEXT,
    location: DataTypes.STRING,
    assignment: DataTypes.STRING,
    entry_time: DataTypes.DATE,
    help_time: DataTypes.DATE,
    exit_time: DataTypes.DATE,
    fixed: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'question',
    tableName: 'question'
  });
  return Question;
};
