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
	  Semester.BelongsToMany(models.Assignment, {
		through: models.Assignment_Semester,
		foreignKey: "sem_id"
	  });
	  Semester.BelongsToMany(models.User, {
		through: models.Semester_User,
		foreignKey: "sem_id"
	  });
	  Semester.BelongsTo(models.Question, {
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
  });
  return Semester;
};