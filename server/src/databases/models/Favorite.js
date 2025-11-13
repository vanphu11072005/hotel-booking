'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    static associate(models) {
      // Favorite belongs to User
      Favorite.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      // Favorite belongs to Room
      Favorite.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room',
      });
    }
  }

  Favorite.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Favorite',
      tableName: 'favorites',
      underscored: true,
      timestamps: true,
    }
  );

  return Favorite;
};
