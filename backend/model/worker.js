const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  profession: String,
  experience: Number,
  description: String,
  charges: Number,
  currentUser: String,
  profilePic: String,
});

module.exports = mongoose.model('Worker', workerSchema);
