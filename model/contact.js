const mongoose = require("mongoose");

const Contact = mongoose.model("contact", {
  nama: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  nohp: {
    type: String,
    required: true,
  },
});

module.exports = { Contact };
