'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // Room belongs to RoomType
      Room.belongsTo(models.RoomType, {
        foreignKey: 'room_type_id',
        as: 'room_type'
      });

      // Room has many Bookings
      Room.hasMany(models.Booking, {
        foreignKey: 'room_id',
        as: 'bookings'
      });
    }
  }

  Room.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      room_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      floor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      status: {
        type: DataTypes.ENUM(
          'available',
          'occupied',
          'maintenance',
          'cleaning'
        ),
        allowNull: false,
        defaultValue: 'available'
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Room',
      tableName: 'rooms',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Room;
};
