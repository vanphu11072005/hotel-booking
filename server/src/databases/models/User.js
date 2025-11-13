'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User belongs to Role
      User.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
      });

      // User has many Bookings
      User.hasMany(models.Booking, {
        foreignKey: 'user_id',
        as: 'bookings'
      });

      // User has many RefreshTokens
      User.hasMany(models.RefreshToken, {
        foreignKey: 'user_id',
        as: 'refresh_tokens'
      });

      // User has many CheckInCheckOut records as staff
      User.hasMany(models.CheckInCheckOut, {
        foreignKey: 'checkin_by',
        as: 'checkins_processed'
      });

      User.hasMany(models.CheckInCheckOut, {
        foreignKey: 'checkout_by',
        as: 'checkouts_processed'
      });
      
      // User has many Reviews
      User.hasMany(models.Review, {
        foreignKey: 'user_id',
        as: 'reviews'
      });

      // User has many Favorites
      User.hasMany(models.Favorite, {
        foreignKey: 'user_id',
        as: 'favorites'
      });
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return User;
};
