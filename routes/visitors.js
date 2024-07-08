const mongoose = require('mongoose');

const visitorSchema = mongoose.Schema({
  name: String,
  membername: String,
  selfie: String,
  contact: String,
  time : {
    type: String, // Store time as a string
    default: new Date().toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  },
  sid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "societies"
  }
});

module.exports = mongoose.model("visitors", visitorSchema);
