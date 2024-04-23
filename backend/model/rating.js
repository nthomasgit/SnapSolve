const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
  user: {
    type: String,
  },
  rating: {
    type: Number,
  },
  taskid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
});

module.exports = mongoose.model('Rating', ratingSchema);
