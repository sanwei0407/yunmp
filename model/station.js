const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('station', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cityid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stationName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    imgs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stationAdd: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stationLat: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true
    },
    stationLng: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'station',
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
