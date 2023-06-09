const { Model, DataTypes } = require("sequelize");

class UserBio extends Model {}

UserBio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      // references:
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "user_bios",
    timestamps: false,
  }
);
