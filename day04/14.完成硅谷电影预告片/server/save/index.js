const Trailers = require('../../models/trailers');

module.exports = async movies => {
  for (var i = 0; i < movies.length; i++) {
    let item = movies[i];
    console.log(item);
    await Trailers.create(item);
  }
}
