'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingRoom extends Model {
    static associate(models) {
      // BookingRoom belongs to Booking
      BookingRoom.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });

      // BookingRoom belongs to Room
      BookingRoom.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
      });
    }
  }

  BookingRoom.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        }
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'BookingRoom',
      tableName: 'booking_rooms',
      underscored: true,
      timestamps: true
    }
  );

  return BookingRoom;
};
