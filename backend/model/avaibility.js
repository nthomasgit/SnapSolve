const mongoose = require('mongoose');

const dayAvailabilitySchema = new mongoose.Schema({
  morning: { type: Boolean, default: false },
  afternoon: { type: Boolean, default: false },
  evening: { type: Boolean, default: false },
  night: { type: Boolean, default: false },
});

const availabilitySchema = new mongoose.Schema({
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
});

const userAvailabilitySchema = new mongoose.Schema({
  user: { type: String, required: true },
  availability: { type: availabilitySchema, required: true },
});

const UserAvailability = mongoose.model(
  'UserAvailability',
  userAvailabilitySchema
);

module.exports = UserAvailability;
