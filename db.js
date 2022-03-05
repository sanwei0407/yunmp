const Sequelize = require('sequelize')
const initModels = require('./model/init-models')

const sequelize = new Sequelize('yun', 'root', 'root', {
  host: '127.0.0.1',
  dialect: 'mysql',
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true
  },
});

module.exports = initModels(sequelize)