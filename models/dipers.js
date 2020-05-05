'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Diper = loader.database.define(
  'dipers',
  {
    diperId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true 
    },
    day: {
      type: Sequelize.DATE,
      allowNull: false
    },
    peepooType: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    memo: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    babyId: {
      type: Sequelize.UUID,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    indexes: [
      {
        fields: ['babyId']
      }
    ]
  }
);

module.exports = Diper;