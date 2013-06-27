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
  this.getSocrataStat('', this.map.selectedGeo);
  this.getPieStats(this.map.selectedGeo);
}

Causes.prototype.getPieStats = function(geo) {
  var self = this;
  $.getJSON('api/bay/stat/causes/all', function(res){
    //self.updateLabels(stat, geo, res);
    //self.addNotes(stat, res[0]);
    self.pie.update(res);
  });
}

Causes.prototype.getSocrataStat = function(stat, geo){
  var self = this;
  //self.chart.update(self.emptyData);
  var stat = 'Agriculture'
  $.getJSON('api/bay/stat/causes/' + stat + '/' + self.map.selectedGeo, function(res){
    //self.updateLabels(stat, geo, res);
    //self.addNotes(stat, res[0]);
    var data = self.prepareData(res);
    console.log(JSON.stringify(data));
    self.chart.update(data);
  });
}

Causes.prototype.prepareData = function(data) {
  var chartData = [];
  var parseDate = d3.time.format("%Y").parse;
  console.log(data);
  for(var i = 0; i < data.length; i++){
    var obj = data[i];
    for(var key in obj){
      var year = key.replace("sum", "").replace("_", "");
      console.log(year);
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