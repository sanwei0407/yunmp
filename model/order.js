const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order', {
    orderid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    startCity: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    arriveCity: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    startStationId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    arriveStationId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    orderState: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    payAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    linkMan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    flightNum: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    udpatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'order',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "orderid" },
        ]
      },
    ]
  });
};
