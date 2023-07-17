var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var mongoDao = require('./dao/mongoDao'); //mongodb select
var mainRouter = require('./router/main');
var material1Router = require('./router/materialMarket1');
var material2Router = require('./router/materialMarket2');
var monitoring1Router = require('./router/keywordMonitoring1');
var monitoring2Router = require('./router/keywordMonitoring2');
var uploadFile = require('./upload/uploadFile');
var dbConnect = require('./dao/connect');
var app = express();
const allowedOrigins = ['http://localhost:8080']; // 허락하는 요청 주소
let corsOptions = {
  origin: allowedOrigins,
  credentials: true
}

dbConnect()

app.use(cors(corsOptions));
app.disable('x-powered-by');

app.use(logger('dev'));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/dao', mongoDao);
app.use('/upload',uploadFile);
app.use('/main', mainRouter);
app.use('/material1', material1Router);
app.use('/material2', material2Router);
app.use('/monitoring1', monitoring1Router);
app.use('/monitoring2', monitoring2Router);
app.use('/uploadPdf', express.static('./pdf'));

app.get('/download', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  const filename = req.query.title;
  const decodedFilename = decodeURIComponent(filename);
  console.log(`Downloading file ... ${decodedFilename}`);

  const filepath = path.join(__dirname, 'public', 'sample', decodedFilename);
  res.download(filepath);
})

app.get('/download_report', function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  const filename = req.query.title;
  const orgFile = filename.split('@@')[0].replace(".txt", ".pdf");
  
  const decodedFilename = decodeURIComponent(orgFile);
  console.log(`Downloading file ... ${decodedFilename}`);

  let dirPath = "";
  if (decodedFilename.toLowerCase().includes("_bm_")) {
    dirPath = "Non_iron";
  } else if (decodedFilename.toLowerCase().includes("_steel_")) {
    dirPath = "iron";
  } else {
    dirPath = "petrochemical";
  }
  
  // const filepath = path.join(__dirname, 'public', 'sample', decodedFilename);
  const filepath = path.join('/root/jupyter/report/done', dirPath, decodedFilename);
  res.download(filepath);
})

module.exports = app;
