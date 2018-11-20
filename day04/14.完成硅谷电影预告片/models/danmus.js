const mongoose = require('mongoose');

const danmusSchema = new mongoose.Schema({
  doubanId: String,
  author: String,
  time: Number,
  text: String,
  color: Number,
  type: Number
})

const Danmus = mongoose.model('danmus', danmusSchema);

module.exports = Danmus;