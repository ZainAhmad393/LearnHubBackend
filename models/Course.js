const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  instructor: String,
  duration: String,
  rating: Number,
  image: String,
  playlistUrl: String,
});

module.exports = mongoose.model('Course', courseSchema);
