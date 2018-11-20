/*
  通过判断用户发送的消息类型，设置具体返回的响应内容
 */
const {url} = require('../config');

module.exports = async message => {
  
  //初始化消息配置对象
  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text'
  }
  
  //初始化一个消息文本
  let content = '你在说什么，我听不懂~';
  
  if (message.MsgType === 'text') {
    if (message.Content === '预告片') {  //全匹配
      options.msgType = 'news';
      options.title = '硅谷电影预告片';
      options.description = '这里有即将上映的电影~';
      options.picUrl = 'http://mmbiz.qpic.cn/mmbiz_png/l6hEPf9t1fELREZNkCURLv7u5SZf4R1CotvXyq08AWrfkVyr60Qc7hYhIuYzFkBsWdCetdS0icuft3Vic0NWYRAw/0?wx_fmt=png';
      options.url = `${url}/movie`;
    } else if (message.Content === '语音识别') {
      options.msgType = 'news';
      options.title = '语音识别电影';
      options.description = '这里用语音搜索你想看的电影~';
      options.picUrl = 'http://mmbiz.qpic.cn/mmbiz_png/l6hEPf9t1fELREZNkCURLv7u5SZf4R1CotvXyq08AWrfkVyr60Qc7hYhIuYzFkBsWdCetdS0icuft3Vic0NWYRAw/0?wx_fmt=png';
      options.url = `${url}/search`;
    } else {
      //搜索相关的电影
      const url = `http://api.douban.com/v2/movie/search`;
      
      const {subjects} = await rp({method: 'GET', url, json: true, qs: {count: 1, q: message.Content}});
  
      options.msgType = 'news';
      options.title = subjects[0].title;
      options.description = `评分：${subjects[0].rating.average}`;
      options.picUrl = subjects[0].images.small;
      options.url = subjects[0].alt;
  
    }
  } else if (message.MsgType === 'voice') {
    //说明用户发送的是语音消息
    //搜索相关的电影
    const url = `http://api.douban.com/v2/movie/search`;
  
    const {subjects} = await rp({method: 'GET', url, json: true, qs: {count: 1, q: message.Recognition}});
  
    options.msgType = 'news';
    options.title = subjects[0].title;
    options.description = `评分：${subjects[0].rating.average}`;
    options.picUrl = subjects[0].images.small;
    options.url = subjects[0].alt;
    
  } else if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      //关注事件/订阅事件
      content = `欢迎您关注硅谷电影公众号~ /n
                回复 预告片 查看硅谷电影预告片 /n
                回复 语音识别 查看语音识别电影 /n
                回复 任意文本 搜索相关的电影 /n
                回复 任意语音 搜索相关的电影 /n
                也可以点击<a href="${url}/search">语音识别</a>来跳转`;
    } else if (message.Event === 'unsubscribe') {
      //取消关注事件
      console.log('无情取关~');
    } else if (message.Event === 'CLICK') {
      if (message.EventKey === 'help') {
        content = `硅谷电影公众号： /n
                回复 预告片 查看硅谷电影预告片 /n
                回复 语音识别 查看语音识别电影 /n
                回复 任意文本 搜索相关的电影 /n
                回复 任意语音 搜索相关的电影 /n
                也可以点击<a href="${url}/search">语音识别</a>来跳转`;
      }
    }
  }
  
  //判断用户发送消息的内容，根据内容返回特定的响应
  options.content = content;
  
  
  return options;
  
}
