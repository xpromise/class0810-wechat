const nanoid = require('nanoid');
const upload = require('./uploadToQiniu');
const Trailers = require('../../models/trailers');

module.exports = async () => {
  //将数据库中所有数据找出来
  const movies = await Trailers.find({});
  //遍历数据
  for (var i = 0; i < movies.length; i++) {
    //文档对象
    let movie = movies[i];
  
    const coverKey = nanoid(10) + '.jpg';
    const imageKey = nanoid(10) + '.jpg';
    const videoKey = nanoid(10) + '.mp4';
    
    await Promise.all([upload(movie.cover, coverKey), upload(movie.image, imageKey), upload(movie.src, videoKey)]);
  
    movie.coverKey = coverKey;
    movie.imageKey = imageKey;
    movie.videoKey = videoKey;
    //保存在数据库中
    await movie.save();
    
  }
  
}