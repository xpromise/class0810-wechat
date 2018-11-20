const express = require('express');
const handleRequest = require('./reply/handleRequest');
const router = require('./router');
const db = require('./db');

const app = express();

app.set('views', 'views');
app.set('view engine', 'ejs');

db
  .then(res => {
    app.use(router);
    app.use(handleRequest());
  })

app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})