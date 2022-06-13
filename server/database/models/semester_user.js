'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Semester_Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Semester_Users.init({
    user_id:{
		type: DataTypes.INTEGER,
		references:{
			model: Assignments,
			key: 'id'
		}
	},
	sem_id:{
		type: DataTypes.STRING(3),
		references:{
			model: Semesters,
			key: 'sem_id'
		}
	},
    is_ta: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'semester_user',
  });
  return Semester_Users;
};