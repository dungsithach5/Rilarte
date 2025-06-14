'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'Sender' });
      Message.belongsTo(models.User, { foreignKey: 'receiver_id', as: 'Receiver' });
    }
  }
  Message.init({
    sender_id: DataTypes.INTEGER,
    receiver_id: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};