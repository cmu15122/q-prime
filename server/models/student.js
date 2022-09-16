'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Student.belongsTo(models.account, {
        foreignKey: 'user_id'
      });
      Student.hasMany(models.question, {
        foreignKey: 'student_id'
      });
    }
  }
  Student.init({
    student_id: {
      type: DataTypes.INTEGER,
      unique: true,
      primaryKey: true,
    },
    num_questions: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    time_on_queue: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'student',
    tableName: 'student'
  });

  return Student;
};
