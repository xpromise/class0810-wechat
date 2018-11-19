/*
  所有的接口定义的模块
 */

//接口地址公共前缀
const prefix = 'https://api.weixin.qq.com/cgi-bin/';

module.exports = {
  accessToken: `${prefix}token?grant_type=client_credential&`,
  menu: {
    create: `${prefix}menu/create?`,
    delete: `${prefix}menu/delete?`
  },
  tag: {
    create: `${prefix}tags/create?`,
    getUsers: `${prefix}user/tag/get?`,
    batch: `${prefix}tags/members/batchtagging?`
  }
}