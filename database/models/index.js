const { Sequelize } = require("sequelize");

//new sequelize connection instance
const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
);

//import all models
const Game = require("./Game")(sequelize);
const User = require("./User")(sequelize);
const UserBio = require("./UserBio")(sequelize);
const UserGameHistory = require("./UserGameHistory")(sequelize);

//table relationship
//Game.hasMany(User);
//User.hasMany(Game);
//User.hasOne(UserBio);

module.exports = {
  Game,
  User,
  UserBio,
  UserGameHistory,
};
