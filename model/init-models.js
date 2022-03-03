var DataTypes = require("sequelize").DataTypes;
var _admin = require("./admin");
var _city = require("./city");
var _flight = require("./flight");
var _linkman = require("./linkman");
var _order = require("./order");
var _station = require("./station");
var _system = require("./system");
var _user = require("./user");

function initModels(sequelize) {
  var admin = _admin(sequelize, DataTypes);
  var city = _city(sequelize, DataTypes);
  var flight = _flight(sequelize, DataTypes);
  var linkman = _linkman(sequelize, DataTypes);
  var order = _order(sequelize, DataTypes);
  var station = _station(sequelize, DataTypes);
  var system = _system(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);


  return {
    admin,
    city,
    flight,
    linkman,
    order,
    station,
    system,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
