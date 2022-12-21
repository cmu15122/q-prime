'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config =  require('../config/config');

const basename = path.basename(__filename);
const db = {};

let sequelize = new Sequelize(config.DB, config.DB_USER, config.DB_PASSWORD, {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: config.DB_DIALECT,
    logging: false,
    omitNull: true,
    dialectOptions: {}
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
