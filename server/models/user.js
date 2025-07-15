'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: 'user_id' });
      User.hasMany(models.Comment, { foreignKey: 'user_id' });
      User.hasMany(models.Like, { foreignKey: 'user_id' });
      User.hasMany(models.Follow, { foreignKey: 'follower_id', as: 'Following' });
      User.hasMany(models.Follow, { foreignKey: 'following_id', as: 'Followers' });
      User.hasMany(models.Message, { foreignKey: 'sender_id', as: 'SentMessages' });
      User.hasMany(models.Message, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
      User.hasMany(models.Notification, { foreignKey: 'user_id' });
      
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
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
    topics: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    firstLogin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
       },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    bio: DataTypes.TEXT,
    avatar_url: DataTypes.STRING(255)
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
