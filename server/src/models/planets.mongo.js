const { model, Schema } = require('mongoose');

const planetSchema = new Schema({
  keplerName: {
    type: String,
    required: true
  }
});

// connects planetSchema with the "planets" collection
module.exports = model('Planet', planetSchema);
