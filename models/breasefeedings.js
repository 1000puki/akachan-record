'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const BreaseFeeding = loader.database.define(
  'breasefeedings',
  {
    breasefeedingId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    day: {
      type: Sequelize.DATE,
      allowNull: false
    },
    rightMinutes: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    leftMinutes: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    milk: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    memo: {
      type: Sequelize.STRING,
      allowNull: true
    },
    babyId: {
      type: Sequelize.UUID,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['babyId']
      }
    ]
  }
);

module.exports = BreaseFeeding;