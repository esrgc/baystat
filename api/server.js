var request = require('request'),
    express = require('express'),
    fs = require('fs'),
    _ = require('underscore'),
    app = express(),
    config = JSON.parse(fs.readFileSync('config/config.json'));

var solutions_url = "https://data.maryland.gov/resource/8nvv-y5u6.json?$$app_token=" + config.app_token;
var causes_url = {
  'Nitrogen': "https://data.maryland.gov/resource/mp2x-4nn6.json?$$app_token=" + config.app_token,
  'Phosphorus': "https://data.maryland.gov/resource/hucz-vxqe.json?$$app_token=" + config.app_token,
  'Sediment': "https://data.maryland.gov/resource/bf9r-nark.json?$$app_token=" + config.app_token
}

//Middleware
app.use(express.bodyParser());

app.get('/', function(req, res){
  res.json('BayStat API');
});

app.get('/bay/stat/solutions/:stat?/:geo?', function(req, res){
  var geo = encodeURIComponent(req.params.geo),
      stat = encodeURIComponent(req.params.stat),
      url = solutions_url + "&$where=basinname='"+geo+"'%20and%20bmpname='"+stat+"'";
  socrata(url, function(json){
    res.json(json);
  });
});

app.get('/bay/stat/causes/:pollution?/:source?/:geo?', function(req, res){
  var geo = encodeURIComponent(req.params.geo),
      source = encodeURIComponent(req.params.source),
      pollution = encodeURIComponent(req.params.pollution),
      url = causes_url[pollution];

  if(req.params.source === "Farms") {
    source = "Agriculture";
  }
  if(req.params.source === "Forests") {
    source = "Forest' or sourcesector='Non-Tidal ATM";
  }
  if(req.params.source === "Wastewater Treatment Plants") {
    source = "Wastewater";
  }
  if(req.params.source === "Stormwater Runoff") {
    source = "Stormwater";
  }
  
  if(req.params.geo === 'Maryland') {
    url += "&$select=sum(wip2017) as milestone2017,sum(_1985),sum(_2007),sum(_2009),sum(_2010),sum(_2011),sum(_2012)";
    if(req.params.source !== 'All Causes') {
      url += "&$where=sourcesector='" + source + "'";
      //url += "&$group=sourcesector";
    }
  } else {
    if(req.params.source === 'All Causes') {
      url += "&$select=sum(wip2017) as milestone2017,sum(_1985),sum(_2007),sum(_2009),sum(_2010),sum(_2011),sum(_2012)";
      url += "&$where=basinname='" + geo + "'";
    } else {
      url += "&$select=wip2017 as milestone2017,_1985,_2007,_2009,_2010,_2011,_2012";
      url += "&$where=basinname='" + geo + "'";
      url += " and (sourcesector='" + source + "')";
    }
  }
  
  socrata(url, function(json){
    if(json.length > 1){
      json = combineSources(json);
    }
    res.json(json);
  });
});

app.get('/bay/stat/sources/:pollution?/:geo?', function(req, res){
  var pollution = encodeURIComponent(req.params.pollution),
      geo = encodeURIComponent(req.params.geo),
      url = causes_url[pollution] + "&$select=sourcesector,sum(_2012)&$group=sourcesector";
      if(req.params.geo !== 'Maryland') {
        url += "&$where=basinname='" + geo + "'";
      }

  socrata(url, function(json){
    res.json(json);
  });
});


app.get('/bay/stats', function(req, res){
  var url = solutions_url + "&$select=bmpname";
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
      if (!error && response.statusCode == 200) {
        next(body);
      } else {
        console.log(error);
        console.log(response.statusCode);
      }
  });
}

function combineSources(json){
  var keys = _.keys(json[0]);
  var combination = {};
  _.each(keys, function(key, idx){
    combination[key] = 0;
  });
  _.each(json, function(obj, key){
    _.each(keys, function(key, idx){
      combination[key] = combination[key] + parseFloat(obj[key]);
    });
  });
  console.log(combination);
  var res = [];
  res.push(combination);
  return res;
}

var port = 3003;
var server = require('http').createServer(app);
server.listen(port);
console.log('Listening on port ' + port);