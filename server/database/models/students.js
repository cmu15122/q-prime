'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Students extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
	  Students.hasOne(models.Users, {foreignKey: 'id'});
	  Students.belongsTo(models.Questions, {foreignKey: 'student_id'});
    }
  }
  Students.init({
    student_id:{
		type: DataTypes.INTEGER,
		primaryKey:true,
		references:{
			model: Users,
			key: 'id'
		}
	},
    num_questions: DataTypes.BIGINT,
    time_on_queue: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Students',
  });
  return Students;
};