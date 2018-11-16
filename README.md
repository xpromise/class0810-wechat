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
