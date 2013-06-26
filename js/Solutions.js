function Solutions(){
  var self = this;
  this.stat = 'Cover Crops';
  this.geo = 'Maryland';
  this.formatComma = d3.format(",");
  this.map = new Map();
  $.getJSON('data/wfr.geojson', function(geojson){
    self.map.addGeoJSON(geojson);
  });
  this.chart = new GeoDash.LineChart("#line-chart .chart", {
    x: 'date',
    y: 'stat',
    width: 'auto',
    height: 'auto',
    colors: ['#d80000', '#006200'],
    interpolate: 'monotone'
  });
  this.pie = new GeoDash.PieChart('#pie .chart', {
    label: 'source',
    value: 'percent',
    colors: ["#d80000", "#0B6909", "#f0db4f"],
    innerRadius: 17,
    drawX: false,
    drawY: false,
    opacity: 0.8
  });
  this.pie.update([
    {"source":"Urban/Suburban","percent":50},
    {"source":"Public Land","percent":4},
    {"source":"Farms","percent":46}
  ]);
  this.addHandlers();
  this.emptyData = this.prepareData([{"_2006":"0","_2005":"0","_2004":"0","_2003":"0","_2009":"0","_2008":"0","_2007":"0","_2013_goal":"0","_2012":"0","_2013":"0","_2000":"0","_2010":"0","_2001":"0","_2011":"0","_2002":"0"}]);
  this.loadData(function(){
    self.getSocrataStat(self.stat, self.geo);
  });
}

Solutions.prototype.loadData = function(next){
  var self = this;
  $.getJSON('data/stats.json', function(res){
    self.statsData = res;
    next();
  });
}

Solutions.prototype.getStats = function() {
  $.getJSON('api/bay/stats/', function(res){
    res.forEach(function(stat){
      console.log(stat);
    });
  });
}

Solutions.prototype.getSocrataStat = function(stat, geo){
  var self = this;
  self.chart.update(self.emptyData);
  $.getJSON('api/bay/stat/' + stat + '/' + geo, function(res){
    self.updateLabels(stat, geo, res);
    self.addNotes(stat, res[0]);
    var data = self.prepareData(res);
    console.log(JSON.stringify(data));
    self.chart.update(data);
  });
}

Solutions.prototype.prepareData = function(data) {
  var chartData = [];
  var parseDate = d3.time.format("%Y").parse;
  for(var i = 2000; i <= 2013; i++) {
    var year = "_" + i, stat;
    console.log(data[0].year);
    if(data[0][year] === undefined) {
      
      stat = 0;
    } else {
      stat = +data[0][year].replace(",", "").replace("*", "");
    }
    chartData.push({
      date: parseDate(i.toString()),
      stat: stat,
      goal: +data[0]["_2013_goal"].replace(",", "").replace("*", "")
    });
  }
  return chartData;
}

Solutions.prototype.updateLabels = function(stat, geo, data){
  $('#line-chart .title').html('<h5>' + stat + ' (' + geo + ')</h5>');
  var units = _.where(dashboard.statsData, {stat: stat})[0].units;
  $('.units').html(units);
  var overlaytext = '<p>2013: ' + this.formatComma(+data[0]['_2013'].replace(",", "").replace("*", "")) + '</p>';
  overlaytext += '<p>2013 Goal: ' + this.formatComma(+data[0]["_2013_goal"].replace(",", "").replace("*", "")) + '</p>';
  $('.overlay').html(overlaytext);
}

Solutions.prototype.addHandlers = function(){
  var self = this;
  $('a.stat').click(function(e){
    e.preventDefault();
    var stat = $(this).html();
    self.stat = $("<div/>").html(stat).text(); //decode
    $('a.stat').removeClass('active');
    $(this).addClass('active');
    self.getSocrataStat(self.stat, self.geo);
  });
  $('a[href="#stat"]').click(function(e){
    e.preventDefault();
    
  })
}

Solutions.prototype.addNotes = function(stat, data) {
  var self = this;
  var def = _.where(self.statsData, {stat: stat})[0].definition;
  $('.def').html('<h6>Definition:</h6><p>' + def + '</p>');
  if(data.footnote) {
    $('.rednote').html('<p>' + data.footnote + '</p>');
  } else {
    $('.rednote').html('');
  }
  var notelist = '';
  if(data.note1) {
    notelist += '<h6>Notes:</h6><ul>';
    notelist += '<li>' + data.note1 + '</li>';
    if(data.note2) {
      notelist += '<li>' + data.note2 + '</li>';
    }
    if(data.note3) {
      notelist += '<li>' + data.note3 + '</li>';
    }
    notelist += '</ul>';
    var html = notelist;
    $('.notes').html(html);
    $('.notes').show();
  } else {
    $('.notes').hide();
  }
}