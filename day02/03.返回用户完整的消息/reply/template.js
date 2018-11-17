/*
  设置最终回复给微信服务器的消息模板
 */

module.exports = options => {
  //返回xml消息给微信服务器
  let replyMessage = `<xml>
      <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
      <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
      <CreateTime>${options.createTime}</CreateTime>
      <MsgType><![CDATA[${options.msgType}]]></MsgType>`;
  
  if (options.msgType === 'text') {
    replyMessage += `<Content><![CDATA[${options.content}]]></Content>`;
  } else if (options.msgType === 'image') {
    replyMessage += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`;
  } else if (options.msgType === 'voice') {
    replyMessage += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`;
  } else if (options.msgType === 'video') {
    replyMessage += `<Video>
      <MediaId><![CDATA[${options.mediaId}]]></MediaId>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      </Video>`;
  } else if (options.msgType === 'music') {
    replyMessage += `<Music>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
      <HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl>
      <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
      </Music>`;
  } else if (options.msgType === 'news') {
    replyMessage += `<ArticleCount>1</ArticleCount>
      <Articles>
      <item>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      <PicUrl><![CDATA[${options.picUrl}]]></PicUrl>
      <Url><![CDATA[${options.url}]]></Url>
      </item>
      </Articles>`;
  }
  
  replyMessage += '</xml>';
  
  return replyMessage;
}