'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoomType extends Model {
    static associate(models) {
      // RoomType has many Rooms
      RoomType.hasMany(models.Room, {
        foreignKey: 'room_type_id',
        as: 'rooms'
      });
      // RoomType has many Reviews (reviews now reference room_type_id)
      RoomType.hasMany(models.Review, {
        foreignKey: 'room_type_id',
        as: 'reviews'
      });
    }
  }

  RoomType.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      amenities: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('amenities');
          if (!rawValue) return [];
          if (typeof rawValue === 'string') {
            try {
              return JSON.parse(rawValue);
            } catch (e) {
              return [];
            }
          }
          return Array.isArray(rawValue) ? rawValue : [];
        }
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
          const rawValue = this.getDataValue('images');
          if (!rawValue) return [];
          if (typeof rawValue === 'string') {
            try {
              return JSON.parse(rawValue);
            } catch (e) {
              return [];
            }
          }
          return Array.isArray(rawValue) ? rawValue : [];
        }
      },
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'RoomType',
      tableName: 'room_types',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return RoomType;
};
