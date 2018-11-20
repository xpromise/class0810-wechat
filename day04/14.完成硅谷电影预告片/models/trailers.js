const mongoose = require('mongoose');

const trailersSchema = new mongoose.Schema({
  cover: String,
  title: String,
  rating: String,
  director: String,
  casts: [String],
  genre: [String],
  releaseDate: String,
  image: String,
  summary: String,
  src: String,
  doubanId: String,
  coverKey: String,
  imageKey: String,
  videoKey: String
})

const Trailers = mongoose.model('trailers', trailersSchema);

module.exports = Trailers;