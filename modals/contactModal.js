const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
 name: String,
  email: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
