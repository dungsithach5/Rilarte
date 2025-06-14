'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    bio: DataTypes.TEXT,
    avatar_url: DataTypes.STRING(255)
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};