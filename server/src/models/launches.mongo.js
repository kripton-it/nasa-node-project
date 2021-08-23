const { model, Schema } = require('mongoose');

const launchSchema = new Schema({
  flightNumber: {
    type: Number,
    required: true
  },
  launchDate: {
    type: Date,
    required: true
  },
  mission: {
    type: String,
    required: true
  },
  rocket: {
    type: String,
    required: true
  },
  target: {
    type: String
  },
  upcoming: {
    type: Boolean,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  customers: [ String ]
});

// connects launchSchema with the "launches" collection
module.exports = model('Launch', launchSchema);
