## 开发中如何使用GIT
* 本地有仓库，远程没有仓库
  * 远程创建仓库
  * 本地进行版本控制
    * git init
    * git add .
    * git commit -m 'xxx'
  * 将本地仓库和远程仓库关联起来
    * git remote add origin xxx
* 本地没有仓库，远程有仓库
  * 获取远程仓库地址，克隆到本地来
    * git clone xxx
  * 假设远程只有master分支，新建dev分支开发
    * git checkout -b dev 新建并切换到指定分支，将当前分支的内容复制到dev上
  * dev分支开发完了(常用)
    * 本地仓库管理
      * git add .
      * git commit -m 'xxx'
    * 提交远程仓库去
      * git push origin dev
    * 切换分支
      * git checkout master
* 需要合并分支内容
  * git checkout master
  * git merge dev
  * git push origin master
* 本地没有仓库，远程有仓库, 并且远程有dev分支内容
  * 将远程仓库克隆到本地来
    * git clone xxx
  * 问题：只有一个分支。想要其它分支的内容
    * git fetch origin dev:dev

## 验证服务器有效性
* 目的：验证消息是否来自于微信服务器（通常做1次）
* 流程：
  * 搭建服务器
  * 通过ngrok内网穿透，就能得到互联网能访问的网址（每次启动网址不一样）
  * 测试号管理页面填写服务器配置
  * 微信签名加密算法：
    * 将参与微信签名加密的三个参数（timestamp、nonce、token）组合在一起，安装字典序排序
    * 将排序后的数组里面的元素拼接在一起，进行sha1加密
    * 加密后得到就是微信签名，与发过来的签名进行对比，如果是，说明消息来自于微信服务器

## 接受用户发送的消息，做了简单的回复
* 流程
  * 接受用户发送的消息
    * 判断请求方式，get请求是验证服务器有效性，而post请求才是微信服务器转发用户的消息
    * 判断消息是否来自于微信服务器
    * 用户消息分为两种：
      * 查询字符串：判断消息是否来自于微信服务器
      * 请求体：req.on绑定事件方式获取数据
  * 将消息格式化
    * 得到用户消息是xml数据，需要转化js对象
    * 去npm仓库搜xml库，通过xml2js转化xml数据
    * 格式化数据，得到js对象
  * 根据消息的内容，做简单的回复
    * 判断message.Content的内容，做出相应的回应
    * 微信要求回复消息内容也必须是xml数据格式
    
## 完成了完整回复
* 对用户发送的消息进行类型判断
  * reply
  * 决定最终回复消息的内容 options
* 回复用户6种消息模板
    
## 获取access_token
* 全局接口的唯一调用凭据
* 实现思路
  读取本地保存access_token（readAccessToken）
    - 有
      - 判断是否过期（isValidAccessToken）
        - 过期了, 重新发送请求，获取access_token（getAccessToken），保存下来（覆盖之前的）(saveAccessToken)
        - 没有过期, 直接使用
    - 没有
      - 发送请求，获取access_token，保存下来