const Sequelize = require('sequelize')
const initModels = require('./model/init-models')

const sequelize = new Sequelize('yun', 'root', 'root', {
  host: '10.0.224.5',
  dialect: 'mysql',
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true
  },
});

module.exports = initModels(sequelize)