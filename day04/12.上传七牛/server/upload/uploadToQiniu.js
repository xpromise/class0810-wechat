/*
  抓取网络资源地址到七牛中
 */
const qiniu = require("qiniu");

const accessKey = 'VEXRGMpBfVe2MJGzdRYlxKX1jt3-CqY4fl_Y3SUS';
const secretKey = '_wD9LklsklhQTOgEmPjHe7-cT0Rr54S_2GeMX82X';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
//config.useHttpsDomain = true;
//config.zone = qiniu.zone.Zone_z1;
const bucketManager = new qiniu.rs.BucketManager(mac, config);

// const resUrl = 'http://devtools.qiniu.com/qiniu.png';
const bucket = 'class0810';
// const key = "qiniu.png";

/*
  resUrl  网络资源地址
  bucket  七牛中对象存储空间名称
  key     要保存的网络资源名称（重命名）  唯一的
 */
module.exports = (resUrl, key) => {
  return new Promise((resolve, reject) => {
    bucketManager.fetch(resUrl, bucket, key, function(err, respBody, respInfo) {
      if (err) {
        console.log(err);
        //throw err;
        reject(err);
      } else {
        if (respInfo.statusCode == 200) {
          resolve();
        }
      }
    });
  })
}
