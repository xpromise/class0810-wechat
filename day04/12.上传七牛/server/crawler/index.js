/*
  1. 爬虫：爬取网页的数据
  2. 原理：借助无头浏览器实现
  3. puppeteer 无头浏览器，通过它实现网页爬虫
    npm i puppeteer -D
  4. 使用：
 */
const puppeteer = require('puppeteer');

module.exports = async () => {
  //1. 打开浏览器
  const browser = await puppeteer.launch({
    //是否以 无头模式（没有界面显示） 运行浏览器
    headless: false
  });
  //2. 打开标签页
  const page = await browser.newPage();
  //3. 输入url地址
  await page.goto('https://movie.douban.com/coming', {waitUntil: 'load'});
  //4. 等待页面加载完成，开始爬取数据
  const result = await page.evaluate(() => {
    //定义一个容器
    let result = [];
    //开始爬取数据
    const $tds = $('.coming_list>tbody>tr').find('td:last');
    for (let i = 0; i < $tds.length; i++) {
      let $td = $($tds[i]);
      let num = +$td.text().split('人')[0];
      if (num >= 1000) {
        const href = $td.parent().find('td:nth(1)>a').attr('href');
        result.push(href);
      }
    }
    //将数据返回出去
    return result;
  });
  console.log(result);
  
  let movies = [];
  
  //开始第二次爬取，爬取电影的详情数据
  for (var i = 0; i < result.length; i++) {
    let item = result[i];
    try {
      //跳转到新的网址
      await page.goto(item, {waitUntil: 'load'});
      //开始爬取数据
      const data = await page.evaluate(() => {
        const $video = $('.related-pic-video');
        if (!$video.length) {
          return null;
        }
    
        const href = $video.attr('href');
        const cover = $video.css('background-image').split('"')[1].split('?')[0];
    
        const title = $('[property="v:itemreviewed"]').text();
        const rating = $('[property="v:average"]').text();
        const director = $('[rel="v:directedBy"]').text();
    
        let casts = [];
        const $star = $('[rel="v:starring"]');
        const length = $star.length > 3 ? 3 : $star.length;
        for (var j = 0; j < length; j++) {
          casts.push($($star[j]).text());
        }
    
        let genre = [];
        const $genre = $('[property="v:genre"]');
        for (var j = 0; j < $genre.length; j++) {
          genre.push($($genre[j]).text());
        }
    
        const releaseDate = $($('[property="v:initialReleaseDate"]')[0]).text();
    
        const image = $('[rel="v:image"]').attr('src');
    
        const summary = $('[property="v:summary"]').text().trim();
    
        return {
          href,
          cover,
          title,
          rating,
          director,
          casts,
          genre,
          releaseDate,
          image,
          summary
        }
      })
  
      if (!data) {
        continue;
      }
  
      data.doubanId = item.split('subject/')[1].split('/')[0];
      //保存数据
      movies.push(data);
    } catch (e) {}
  }
  
  //开始第三次爬取，爬取电影链接
  for (var i = 0; i < movies.length; i++) {
    let item = movies[i];
    //跳转到新的网址
    await page.goto(item.href, {waitUntil: 'load'});
    //开始爬取数据
    const data = await page.evaluate(() => {
      return $('video>source').attr('src');
    })
    
    item.src = data;
    
    delete item.href;
  }
  
  console.log(movies);
  
  //5. 关闭浏览器
  await browser.close();
  
  return movies;
}