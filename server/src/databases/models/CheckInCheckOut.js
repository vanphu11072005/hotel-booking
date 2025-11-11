'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CheckInCheckOut extends Model {
    static associate(models) {
      // CheckInCheckOut belongs to Booking
      CheckInCheckOut.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });

      // CheckInCheckOut belongs to User (staff who checked in)
      CheckInCheckOut.belongsTo(models.User, {
        foreignKey: 'checkin_by',
        as: 'checked_in_by'
      });

      // CheckInCheckOut belongs to User (staff who checked out)
      CheckInCheckOut.belongsTo(models.User, {
        foreignKey: 'checkout_by',
        as: 'checked_out_by'
      });
    }
  }

  CheckInCheckOut.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      checkin_time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      checkout_time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      checkin_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      checkout_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      room_condition_checkin: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      room_condition_checkout: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      additional_charges: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'CheckInCheckOut',
      tableName: 'checkin_checkout',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return CheckInCheckOut;
};
