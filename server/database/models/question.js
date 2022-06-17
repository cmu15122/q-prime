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
    }
  }
  Question.init({
    question_id: {
      type: DataTypes.INTEGER,
      unique: true,
      primaryKey: true
    },
    student_id:{
      type: DataTypes.INTEGER,
    },
    ta_id:{
      type: DataTypes.INTEGER,
    },
    sem_id:{
      type: DataTypes.STRING(3),
    },
    question: DataTypes.TEXT,
    tried_so_far: DataTypes.TEXT,
    location: DataTypes.STRING,
    assignment: DataTypes.STRING,
    entry_time: DataTypes.DATE,
    help_time: DataTypes.DATE,
    exit_time: DataTypes.DATE,
    num_asked_to_fix: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'question',
    tableName: 'question'
  });
  return Question;
};
