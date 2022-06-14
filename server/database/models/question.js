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
	  Question.hasMany(models.Semester, {foreignKey: 'sem_id'});
	  Question.hasMany(models.Student, {foreignKey: 'student_id'});
	  Question.hasMany(models.TA, {foreignKey: 'ta_id'});
    }
  }
  Question.init({
	student_id:{
		type: DataTypes.INTEGER,
		references:{
			model: Student,
			key: 'student_id'
		}
	},
	ta_id:{
		type: DataTypes.INTEGER,
		references:{
			model: TA,
			key: 'ta_id'
		}

	},
	sem_id:{
		type: DataTypes.STRING,
		references:{
			model: Semester,
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
  });
  return Question;
};