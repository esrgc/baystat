var request = require('request'),
    express = require('express'),
    fs = require('fs'),
    _ = require('underscore'),
    app = express(),
    config = JSON.parse(fs.readFileSync('config/config.json'));

var dataurl = "https://data.maryland.gov/resource/8nvv-y5u6.json?$$app_token=" + config.app_token;
var causes_url = "https://data.maryland.gov/resource/mp2x-4nn6.json?$$app_token=" + config.app_token;


//Middleware
app.use(express.bodyParser());

app.get('/', function(req, res){
  res.json('BayStat API');
});

app.get('/bay/stat/solutions/:stat?/:geo?', function(req, res){
  var geo = encodeURIComponent(req.params.geo),
      stat = encodeURIComponent(req.params.stat),
      url = dataurl + "&$where=basinname='"+geo+"'%20and%20bmpname='"+stat+"'";
  socrata(url, function(json){
    res.json(json);
  });
});

app.get('/bay/stat/causes/:source?/:geo?', function(req, res){
  var geo = encodeURIComponent(req.params.geo),
      source = encodeURIComponent(req.params.source),
      url = causes_url + "&$select=sum(_1985),sum(_2007),sum(_2009),sum(_2010),sum(_2011),sum(_2012)&$where=sourcesector='Agriculture'&$group=sourcesector";

  if(source === 'all') {
    url = causes_url + "&$select=sourcesector,sum(_2012)&$group=sourcesector";
  }

  socrata(url, function(json){
    res.json(json);
  });
});


app.get('/bay/stats', function(req, res){
  var url = dataurl + "&$select=bmpname";
  socrata(url, function(json){
    var stats = _.pluck(json, 'bmpname');
    stats = _.uniq(stats);
    res.json(stats);
  });
});

function socrata(url, next) {
  console.log(url);
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