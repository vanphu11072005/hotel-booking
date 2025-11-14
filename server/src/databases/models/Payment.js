'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Payment belongs to Booking
      Payment.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
      
      // Self-referencing for deposit/remaining payment relationship
      Payment.belongsTo(models.Payment, {
        foreignKey: 'related_payment_id',
        as: 'related_payment'
      });
      Payment.hasMany(models.Payment, {
        foreignKey: 'related_payment_id',
        as: 'related_payments'
      });
    }
  }

  Payment.init(
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      payment_method: {
        type: DataTypes.ENUM(
          'cash',
          'credit_card',
          'debit_card',
          'bank_transfer',
          'e_wallet'
        ),
        allowNull: false
      },
      payment_type: {
        type: DataTypes.ENUM('full', 'deposit', 'remaining'),
        allowNull: false,
        defaultValue: 'full'
      },
      deposit_percentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      related_payment_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      payment_status: {
        type: DataTypes.ENUM(
          'pending',
          'completed',
          'failed',
          'refunded'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Payment;
};
