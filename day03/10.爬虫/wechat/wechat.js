/*
  获取access_token。
  1. 是什么？
    微信公众号的全局唯一接口调用凭据
    
    接口/api  application interface:
      1. url地址： 全称包含：请求方式、请求地址、请求参数、响应内容等
      2. 公共函数/方法
  2. 作用：
    使用access_token才能成功调用微信的各个接口
  3. 特点：
    1. access_token的存储至少要保留512个字符空间
    2. 有效期目前为2个小时，提前5分钟刷新
    3. 重复获取将导致上次获取的access_token失效，注意不要用别人的appid appseceret
    4. access_token接口调用时有限的，大概为2000次
  4. 请求地址
    https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
  5. 请求方式：
    GET
  6. 请求成功的响应结果：
    JSON： {"access_token":"ACCESS_TOKEN","expires_in":7200}
  7. 发送请求：
    npm install --save request request-promise-native
  8. 设计：
    - 第一次发送请求，获取access_token，保存下来
    - 第二次读取之前保存的access_token，判断是否过期
      - 过期了, 重新发送请求，获取access_token，保存下来（覆盖之前的）
      - 没有过期, 直接使用
   整理：
     读取本地保存access_token（readAccessToken）
      - 有
        - 判断是否过期（isValidAccessToken）
          - 过期了, 重新发送请求，获取access_token（getAccessToken），保存下来（覆盖之前的）(saveAccessToken)
          - 没有过期, 直接使用
      - 没有
        - 发送请求，获取access_token，保存下来
 */
const rp = require('request-promise-native');
const {writeFile, readFile, createReadStream} = require('fs');
const {appID, appsecret} = require('../config');
const api = require('../api');
const {writeFileAsync, readFileAsync} = require('../utils/tools');

class Wechat {
  /**
   * 获取access_token
   * @return {Promise<result>}
   */
  async getAccessToken () {
    //定义请求地址
    const url = `${api.accessToken}appid=${appID}&secret=${appsecret}`;
    //发送请求
    const result = await rp({method: 'GET', url, json: true});
    //设置access_token的过期时间, 提前5分钟刷新
    result.expires_in = Date.now() + 7200000 - 300000;
    //返回result
    return result;
  }
  
  /**
   * 保存access_token
   * @param filePath  要保存的文件路径
   * @param accessToken  要保存的凭据
   * @return {Promise<any>}
   */
  saveAccessToken (filePath, accessToken) {
    return writeFileAsync(filePath, accessToken);
  }
  
  /**
   * 读取access_token
   * @param filePath 文件路径
   * @return {Promise<any>}
   */
  readAccessToken (filePath) {
    return writeFileAsync(filePath);
  }
  
  /**
   * 判断access_token是否过期
   * @param accessToken
   * @return {boolean}
   */
  isValidAccessToken ({expires_in}) {
    /*if (Date.now() >= expires_in) {
      //说明过期了
      return false
    } else {
      //说明没有过期
      return true
    }*/
    return Date.now() < expires_in;
  }
  
  /**
   * 返回有效access_token的方法
   * @return {Promise<accessToken>}
   */
  fetchAccessToken () {
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      console.log('进来了~');
      //说明access_token是有效的
      return Promise.resolve({access_token: this.access_token, expires_in: this.expires_in});
    }
    
    //最终目的返回有效access_token
    return this.readAccessToken('./accessToken.txt')
      .then(async res => {
        if (this.isValidAccessToken(res)) {
          //没有过期，直接使用
          //作为then函数返回值， promise对象包着res
          return res;
        } else {
          //过期了
          const accessToken = await this.getAccessToken();
          await this.saveAccessToken('./accessToken.txt', accessToken);
          //作为then函数返回值， promise对象包着accessToken
          return accessToken;
        }
      })
      .catch(async err => {
        const accessToken = await this.getAccessToken();
        await this.saveAccessToken('./accessToken.txt', accessToken);
        return accessToken;
      })
      .then(res => {
        //不管上面成功或者失败都会来到这
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        
        return Promise.resolve(res);
      })
    
  }
  
  async getTicket () {
    //获取access_token
    const {access_token} = await this.fetchAccessToken();
    //定义请求地址
    const url = `${api.ticket}access_token=${access_token}`;
    //发送请求
    const result = await rp({method: 'GET', url, json: true});
    //设置access_token的过期时间, 提前5分钟刷新
    // result.expires_in = Date.now() + 7200000 - 300000;
    //返回result
    return {
      ticket: result.ticket,
      ticket_expires_in: Date.now() + 7200000 - 300000
    };
  }
  
  saveTicket (filePath, ticket) {
    return writeFileAsync(filePath, ticket);
  }
  
  readTicket (filePath) {
    return readFileAsync(filePath);
  }
  
  isValidTicket ({ticket_expires_in}) {
    /*if (Date.now() >= expires_in) {
      //说明过期了
      return false
    } else {
      //说明没有过期
      return true
    }*/
    return Date.now() < ticket_expires_in;
  }
  
  fetchTicket () {
    if (this.ticket && this.ticket_expires_in && this.isValidTicket(this)) {
      console.log('进来了~');
      return Promise.resolve({ticket: this.ticket, ticket_expires_in: this.ticket_expires_in});
    }
    
    return this.readTicket('./ticket.txt')
      .then(async res => {
        if (this.isValidTicket(res)) {
          //没有过期，直接使用
          //作为then函数返回值， promise对象包着res
          return res;
        } else {
          //过期了
          const ticket = await this.getTicket();
          await this.saveTicket('./ticket.txt', ticket);
          //作为then函数返回值， promise对象包着accessToken
          return ticket;
        }
      })
      .catch(async err => {
        const ticket = await this.getTicket();
        await this.saveTicket('./ticket.txt', ticket);
        return ticket;
      })
      .then(res => {
        //不管上面成功或者失败都会来到这
        this.ticket = res.ticket;
        this.ticket_expires_in = res.ticket_expires_in;
        
        return Promise.resolve(res);
      })
    
  }
  
  /**
   * 创建自定义菜单
   * @param menu
   * @return {Promise<*>}
   */
  async createMenu (menu) {
    try {
      //获取access_token
      const {access_token} = await this.fetchAccessToken();
      //定义请求地址
      const url = `${api.menu.create}access_token=${access_token}`;
      //发送请求
      const result = await rp({method: 'POST', url, json: true, body: menu});
  
      return result;
    } catch (e) {
      return 'createMenu方法出了问题：' + e;
    }
  }
  
  /**
   * 删除菜单
   * @return {Promise<*>}
   */
  async deleteMenu () {
    try {
      //获取access_token
      const {access_token} = await this.fetchAccessToken();
      //定义请求地址
      const url = `${api.menu.delete}access_token=${access_token}`;
      //发送请求
      const result = await rp({method: 'GET', url, json: true});
  
      return result;
    } catch (e) {
      return 'deleteMenu方法出了问题：' + e;
    }
  }
  
  /**
   * 创建标签
   * @param name 标签名
   * @return {Promise<*>}
   */
  async createTag (name) {
    try {
      //获取access_token
      const {access_token} = await this.fetchAccessToken();
      //定义请求地址
      const url = `${api.tag.create}access_token=${access_token}`;
      //发送请求
      const result = await rp({method: 'POST', url, json: true, body: {tag: {name}}});
      
      return result;
    } catch (e) {
      return 'createTag方法出了问题：' + e;
    }
  }
  
  async getTagUsers (tagid, next_openid = '') {
    try {
      const {access_token} = await this.fetchAccessToken();
      const url = `${api.tag.getUsers}access_token=${access_token}`;
      return await rp({method: 'POST', url, json: true, body: {tagid, next_openid}});
    } catch (e) {
      return 'getTagUsers方法出了问题' + e;
    }
  }
  
  async batchUsersTag (openid_list, tagid) {
    try {
      const {access_token} = await this.fetchAccessToken();
      const url = `${api.tag.batch}access_token=${access_token}`;
      return await rp({method: 'POST', url, json: true, body: {tagid, openid_list}});
    } catch (e) {
      return 'batchUsersTag方法出了问题' + e;
    }
  }
  
  /**
   * 根据标签群发消息
   * @param options
   * @return {Promise<*>}
   */
  async sendAllByTag (options) {
    try {
      const {access_token} = await this.fetchAccessToken();
      const url = `${api.message.sendall}access_token=${access_token}`;
      return await rp({method: 'POST', url, json: true, body: options});
    } catch (e) {
      return 'sendAllByTag方法出了问题' + e;
    }
  }
  
  async uploadMaterial (type, material, body) {
    try {
      //获取access_token
      const {access_token} = await this.fetchAccessToken();
      //定义请求地址
      let url = '';
      let options = {method: 'POST', json: true};
      
      if (type === 'news') {
        url = `${api.upload.uploadNews}access_token=${access_token}`;
        //请求体参数
        options.body = material;
      } else if (type === 'pic') {
        url = `${api.upload.uploadimg}access_token=${access_token}`;
        //以form表单上传
        options.formData = {
          media: createReadStream(material)
        }
      } else {
        url = `${api.upload.uploadOthers}access_token=${access_token}&type=${type}`;
        //以form表单上传
        options.formData = {
          media: createReadStream(material)
        }
        
        if (type === 'video') {
          options.body = body;
        }
        
      }
  
      options.url = url;
      
      //发送请求
      return await rp(options);
      
    } catch (e) {
      return 'uploadMaterial方法出了问题' + e;
    }
    
  }
  
  
}

//测试微信接口功能
(async () => {
  const w = new Wechat();
  
  /*//上传图片获取media_id
  let result1 = await w.uploadMaterial('image', './node.jpg');
  console.log(result1);
  /!*
  { media_id: '1_821D3VHxMTbMuZ5-DSoMdegIBNCcnH8CbuuCWBZrw',
  url: 'http://mmbiz.qpic.cn/mmbiz_png/l6hEPf9t1fELREZNkCURLv7u5SZf4R1CotvXyq08AWrfkVyr60Qc7hYhIuYzFkBsWdCetdS0icuft3Vic0NWYRAw/0?wx_fmt=png
   *!/
    //上传图片获取地址
  let result2 = await w.uploadMaterial('pic', './logo.png');
  console.log(result2);
  /!*
  { url: 'http://mmbiz.qpic.cn/mmbiz_png/l6hEPf9t1fELREZNkCURLv7u5SZf4R1Cib5tbQCCx8ic3qMOl3pHaianpyrgqRlQZmt2GH3ZVR4OpRjXrS6pEpXhA/0' }
   *!/
  //上传图文消息
  let result3 = await w.uploadMaterial('news', {
    "articles": [{
      "title": '微信公众号开发',
      "thumb_media_id": result1.media_id,
      "author": '佚名',
      "digest": '这里是class0810开发的',
      "show_cover_pic": 1,
      "content": `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                  </head>
                  <body>
                    <h1>微信公众号开发</h1>
                    <img src="${result2.url}">
                  </body>
                  </html>`,
      "content_source_url": 'http://www.atguigu.com',
      "need_open_comment":1,
      "only_fans_can_comment":1
    },
      {
        "title": 'class0810',
        "thumb_media_id": result1.media_id,
        "author": '佚名',
        "digest": '课程学了一大半了~马上要毕业了',
        "show_cover_pic": 0,
        "content": '今天天气真晴朗',
        "content_source_url": 'https://www.baidu.com',
        "need_open_comment":0,
        "only_fans_can_comment":0
      }
    ]
  });
  console.log(result3);
  /!*
  { media_id: '1_821D3VHxMTbMuZ5-DSoIWBsxL-yM3hCmIuKS430HQ' }
   *!/*/
  
  //删除菜单，再重新创建
  /*let result = await w.deleteMenu();
  console.log(result);
  result = await w.createMenu(require('./menu'));
  console.log(result);*/
})()

module.exports = Wechat;