/*
  工具方法
 */
const {parseString} = require('xml2js');
const {writeFile, readFile} = require('fs');

module.exports = {
  getUserDataAsync (req) {
    return new Promise(resolve => {
      //接受数据
      let result = '';
      req
        .on('data', data => {
          console.log(data.toString()); //buffer
          result += data.toString();
        })
        .on('end', () => {
          console.log('用户数据接受完毕');
          resolve(result);
        })
    })
    
  },
  parseXMLDataAsync (xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, {trim: true}, (err, data) => {
        if (!err) {
          resolve(data);
        } else {
          reject('parseXMLDataAsync方法出了问题：' + err);
        }
      })
    })
  },
  formatMessage ({xml}) {
    // const {xml} = jsData
    //去掉xml
    //去掉[]
    let result = {};
    //遍历对象
    for (let key in xml) {
      //获取属性值
      let value = xml[key];
      //去掉[]
      result[key] = value[0];
    }
    
    return result;
  },
  writeFileAsync (filePath, data) {
    return new Promise((resolve, reject) => {
      //js对象没办法存储，会默认调用toString() --->  [object Object]
      //将js对象转化为json字符串
      writeFile(filePath, JSON.stringify(data), err => {
        if (!err) {
          resolve();
        } else {
          reject('writeFileAsync方法出了问题：' + err);
        }
      })
    })
  },
  readFileAsync (filePath) {
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        //读取的data数据  二进制数据，buffer
        if (!err) {
          //在调用JSON.parse将json字符串解析为js对象
          resolve(JSON.parse(data.toString()));
        } else {
          reject('readFileAsync方法出了问题:' + err);
        }
      })
    })
  }
}