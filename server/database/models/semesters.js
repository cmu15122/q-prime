'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Semesters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ 
    static associate(models) {
      // define association here
	  Semesters.BelongsToMany(models.Assignments, {
		through: models.Assignment_Semester,
		foreignKey: "sem_id"
	  });
	  Semesters.BelongsToMany(models.Users, {
		through: models.Semester_User,
		foreignKey: "sem_id"
	  });
	  Semesters.BelongsTo(models.Questions, {
		foreignKey: "sem_id"
	  })
    }
  }
  Semesters.init({
    sem_id:{
		type: DataTypes.STRING(3),
		unique: true,
		defaultValue: false,
		primaryKey: true
	},
  }, {
    sequelize,
    modelName: 'semesters',
  });
  return Semesters;
};