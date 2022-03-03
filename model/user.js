const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    uid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    wxNickName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    wxHeadPhoto: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    wxInfo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    wxOpenId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
    ]
  });
};
