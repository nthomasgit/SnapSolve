const mongoose = require('mongoose');
const reviewSchema = mongoose.Schema({
  taskid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  rating: {
    type: Number,
  },
  review: {
    type: String,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
