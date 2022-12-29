'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Semester_User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Semester_User.belongsTo(models.account, {
        foreignKey: 'user_id'
      });
      Semester_User.belongsTo(models.semester, {
        foreignKey: 'sem_id'
      });
    }
  }
  Semester_User.init({
    user_id:{
      type: DataTypes.INTEGER,
    },
    sem_id:{
      type: DataTypes.STRING(3),
    },
    is_ta: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  }, {
    sequelize,
    modelName: 'semester_user',
    tableName: 'semester_user'
  });
  return Semester_User;
};
