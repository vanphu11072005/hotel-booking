'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // Booking belongs to User
      Booking.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Booking belongs to Room
      Booking.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
      });

      // Booking has many Payments
      Booking.hasMany(models.Payment, {
        foreignKey: 'booking_id',
        as: 'payments'
      });

      // Booking has many ServiceUsages
      Booking.hasMany(models.ServiceUsage, {
        foreignKey: 'booking_id',
        as: 'service_usages'
      });

      // Booking has one CheckInCheckOut
      Booking.hasOne(models.CheckInCheckOut, {
        foreignKey: 'booking_id',
        as: 'checkin_checkout'
      });
    }
  }

  Booking.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      booking_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      check_in_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      check_out_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isAfterCheckIn(value) {
            if (value <= this.check_in_date) {
              throw new Error(
                'Check-out date must be after check-in date'
              );
            }
          }
        }
      },
      num_guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed',
          'checked_in',
          'checked_out',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      special_requests: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Booking;
};
