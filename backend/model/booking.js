const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  service: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  issue: {
    type: String,
    required: true,
  },
  requester: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rejected'],
    default: 'Pending',
  },
  reject: {
    type: Boolean,
    default: false,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
