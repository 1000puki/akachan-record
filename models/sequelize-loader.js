'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/akachan_record'
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
}