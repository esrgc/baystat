var request = require('request'),
    express = require('express'),
    fs = require('fs'),
    _ = require('underscore'),
    app = express(),
    config = JSON.parse(fs.readFileSync('config/config.json'));

var dataurl = "https://data.maryland.gov/resource/v5pd-9ptg.json?$$app_token=" + config.app_token;

//Middleware
app.use(express.bodyParser());

app.get('/', function(req, res){
  res.json('BayStat API');
});

app.get('/bay/stat/:stat?/:geo?', function(req, res){
  var geo = encodeURIComponent(req.params.geo),
      stat = encodeURIComponent(req.params.stat),
      url = dataurl + "&$where=basinname='"+geo+"'%20and%20bmpname2='"+stat+"'";
  socrata(url, function(json){
    res.json(json);
  });
});

app.get('/bay/stats', function(req, res){
  var url = dataurl + "&$select=bmpname2";
  socrata(url, function(json){
    var stats = _.pluck(json, 'bmpname2');
    stats = _.uniq(stats);
    res.json(stats);
  });
});

function socrata(url, next) {
  request({
    url: url,
    json: true,
    auth: {
      user: config.username,
      pass: config.password
    }}, function (error, response, body) {
      console.log(response.statusCode);
      if (!error && response.statusCode == 200) {
        next(body);
      } else {
        console.log(error);
        console.log(response.statusCode);
      }
  });
}

var port = 3003;
var server = require('http').createServer(app);
server.listen(port);
console.log('Listening on port ' + port);