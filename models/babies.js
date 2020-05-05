'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Baby = loader.database.define(
  'babies',
  {
    babyId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    babyName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    sex:{
      type: Sequelize.INTEGER,
      allowNull: false
    },
    interval:{
      type: Sequelize.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamp: false,
    indexes: [
      {
        fields: ['userId']
      }
    ]
  }
);

module.exports = Baby;