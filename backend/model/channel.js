const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const channelSchema = new Schema({
  user1: { type: String, required: true },
  user2: { type: String, required: true },
  channelId: { type: Number, required: true, unique: true },
});

const messageSchema = new Schema({
  channelId: { type: Number, ref: 'Channel', required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  unread: { type: Boolean, default: false },
});

// Create models for the schemas
const Channel = mongoose.model('Channel', channelSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Channel, Message };
