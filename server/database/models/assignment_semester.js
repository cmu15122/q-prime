'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Assignment_Semester extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Assignment_Semester.init({
    assignmentId:{
		type: DataTypes.INTEGER,
		references:{
			model: Assignments,
			key: 'id'
		}
	},
	semesterId:{
		type: DataTypes.STRING(3),
		references:{
			model: Semesters,
			key: 'sem_id'
		}
	},
    start_date:{
		type: DataTypes.DATE,
		allowNull: false
	},
	end_date:{
		type: DataTypes.DATE,
		allowNull: false
	},
  }, {
    sequelize,
    modelName: 'Assignment_Semester',
  });
  return Assignment_Semester;
};