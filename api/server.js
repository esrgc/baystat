var request = require('request'),
    express = require('express'),
    fs = require('fs'),
    app = express(),
    config = JSON.parse(fs.readFileSync('config/config.json'));

//Middleware
app.use(express.bodyParser());

app.get('/', function(req, res){
  res.json('BayStat API');
});

app.get('/bay/:stat?/:geo?', function(req, res){
  socrata(req.params.stat, req.params.geo, function(json){
    res.json(json);
  });
});

function socrata(stat, geo, next) {
  var url = "https://data.maryland.gov/resource/cdiv-czd8.json?$$app_token=" + config.app_token + "&$where=basinname='"+geo+"'%20and%20bmpname='"+stat+"'";
  request({
    url: url,
    json: true,
    auth: {
      user: config.username,
      pass: config.password
    }}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        next(body);
      }
  });
}

var port = 3003;
var server = require('http').createServer(app);
server.listen(port);
console.log('Listening on port ' + port);