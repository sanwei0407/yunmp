const Sequelize = require('sequelize')
const initModels = require('./model/init-models')
const config = require('./config')

const { db_name,db_host,db_username,db_pwd} = config;
const sequelize = new Sequelize(db_name, db_username, db_pwd, {
  host: db_host,
  dialect: 'mysql',
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true
  },
});

module.exports = initModels(sequelize)