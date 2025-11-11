'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ServiceUsage extends Model {
    static associate(models) {
      // ServiceUsage belongs to Booking
      ServiceUsage.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });

      // ServiceUsage belongs to Service
      ServiceUsage.belongsTo(models.Service, {
        foreignKey: 'service_id',
        as: 'service'
      });
    }
  }

  ServiceUsage.init(
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
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      usage_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'ServiceUsage',
      tableName: 'service_usages',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return ServiceUsage;
};
