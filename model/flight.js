const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('flight', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    startCity: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    arriveCity: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ticketPrice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxNum: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preDay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    startStations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    arriveStations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startTime: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    spass: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    epass: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    carType: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    carLinker: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isHot: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    often: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'flight',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
