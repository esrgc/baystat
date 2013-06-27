function Causes(){
  var self = this;
  this.map = new Map({
    zoom: 8,
    lat: 38.77121,
    lng: -77.31628
  });
  $.getJSON('data/wfr.geojson', function(geojson){
    self.map.addGeoJSON(geojson);
  });
  this.chart = new GeoDash.LineChart("#line .chart", {
    x: 'date',
    y: 'stat',
    width: 'auto',
    height: 'auto',
    colors: ['#d80000', '#006200'],
    interpolate: 'linear'
  });
  this.pie = new GeoDash.PieChart('#pie .chart', {
    label: 'sourcesector',
    value: 'sum_2012',
    colors: ["#d80000", "#0B6909", "#f0db4f", "#66adda", "#ff6600", "#a882c5"],
    innerRadius: 17,
    drawX: false,
    drawY: false,
    opacity: 0.7,
    legend: '#pie .legend'
  });
  this.addEvents();
  this.getSocrataStat();
  this.getPieStats();
}

Causes.prototype.addEvents = function() {
  var self = this;
  $('#pollution').change(function(){
    self.getPieStats();
    self.getSocrataStat();
  });
  $('#source').change(function(){
    self.getSocrataStat();
  });
}

Causes.prototype.getPieStats = function() {
  var self = this;
  var pollution = $('#pollution input:checked').val();
  $.getJSON('api/bay/stat/sources/' + pollution, function(res){
    self.pie.update(res);
  });
}

Causes.prototype.getSocrataStat = function(){
  var self = this;
  var stat = $('#source').val();
  var pollution = $('#pollution input:checked').val();
  $.getJSON('api/bay/stat/causes/' + pollution + '/' + stat + '/' + self.map.selectedGeo, function(res){
    //self.updateLabels(stat, geo, res);
    //self.addNotes(stat, res[0]);
    var data = self.prepareData(res);
    self.chart.update(data);
  });
}

Causes.prototype.prepareData = function(data) {
  var chartData = [];
  var parseDate = d3.time.format("%Y").parse;
  for(var i = 0; i < data.length; i++){
    var obj = data[i];
    for(var key in obj){
      var year = key.replace("sum", "").replace("_", "");
      chartData.push({
        date: parseDate(year),
        stat: obj[key]
      });
    }
  }
  chartData.sort(function(a,b){
    a = new Date(a.date);
    b = new Date(b.date);
    return a<b?-1:a>b?1:0;
  });
  return chartData;
}