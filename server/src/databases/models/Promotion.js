'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    static associate(models) {
      // Associations can be defined here if needed
    }

    isValid() {
      const now = new Date();
      return (
        this.is_active &&
        now >= this.start_date &&
        now <= this.end_date &&
        (this.usage_limit === null ||
          this.used_count < this.usage_limit)
      );
    }

    calculateDiscount(bookingAmount) {
      if (!this.isValid()) return 0;

      if (
        this.min_booking_amount &&
        bookingAmount < this.min_booking_amount
      ) {
        return 0;
      }

      let discount = 0;
      if (this.discount_type === 'percentage') {
        discount = (bookingAmount * this.discount_value) / 100;
      } else if (this.discount_type === 'fixed_amount') {
        discount = parseFloat(this.discount_value);
      }

      if (
        this.max_discount_amount &&
        discount > this.max_discount_amount
      ) {
        discount = parseFloat(this.max_discount_amount);
      }

      return discount;
    }
  }

  Promotion.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed_amount'),
        allowNull: false
      },
      discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      min_booking_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isAfterStartDate(value) {
            if (value <= this.start_date) {
              throw new Error(
                'End date must be after start date'
              );
            }
          }
        }
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1
        }
      },
      used_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Promotion',
      tableName: 'promotions',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return Promotion;
};
