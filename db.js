const Sequelize = require('sequelize')
const initModels = require('./model/init-models')

// Qfdixon2022
const sequelize = new Sequelize('yun', 'root', 'Qfdixon2022', {
  host: '10.0.224.5',
  dialect: 'mysql',
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true
  },
});

module.exports = initModels(sequelize)