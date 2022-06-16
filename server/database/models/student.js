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
      Student.hasOne(models.account, {foreignKey: 'id'});
      Student.belongsTo(models.question, {foreignKey: 'student_id'});
    }
  }
  Student.init({
    student_id:{
      type: DataTypes.INTEGER,
      primaryKey:true,
      references:{
        model: 'account',
        key: 'id'
      }
    },
    num_Question: DataTypes.BIGINT,
    time_on_queue: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'student',
    tableName: 'student'
  });
  return Student;
};
