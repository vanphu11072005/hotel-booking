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

      // Self-referencing: Booking has parent (for multi-room bookings)
      Booking.belongsTo(models.Booking, {
        foreignKey: 'parent_booking_id',
        as: 'parent_booking'
      });

      // Booking has many child bookings
      Booking.hasMany(models.Booking, {
        foreignKey: 'parent_booking_id',
        as: 'child_bookings'
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

      // Booking has many BookingRooms (junction table)
      Booking.hasMany(models.BookingRoom, {
        foreignKey: 'booking_id',
        as: 'booking_rooms'
      });

      // Booking belongs to many Rooms through BookingRoom
      Booking.belongsToMany(models.Room, {
        through: models.BookingRoom,
        foreignKey: 'booking_id',
        otherKey: 'room_id',
        as: 'rooms'
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
      guest_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Thông tin khách đặt phòng (full_name, email, phone)'
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'vnpay'),
        allowNull: true,
        defaultValue: 'cash'
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
      deposit_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      requires_deposit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      special_requests: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cancellation_reason: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      cancellation_details: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      parent_booking_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID của booking cha (dùng để group multi-room bookings)'
      },
      room_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        },
        comment: 'Số lượng phòng cùng loại được đặt'
      },
      deposit_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Số tiền đặt cọc'
      },
      guest_count: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue('num_guests');
        }
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
