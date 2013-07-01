function Causes(){
  var self = this;
  this.map = new Map({
    zoom: 8,
    lat: 38.77121,
    lng: -77.31628
  });
  L.tileLayer('http://{s}.tiles.mapbox.com/v3/esrgc.mdblur/{z}/{x}/{y}.png').addTo(self.map.map);
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
    innerRadius: 1,
    drawX: false,
    drawY: false,
    opacity: 0.7,
    legend: '#pie .legend'
  });
  this.details = {
    'nitrogen': "Nitrogen: Nitrogen pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Sources of nitrogen pollution include air pollution from vehicles, coal-burning power plants and industry, fertilizers from farm fields, lawns and golf courses, wastewater from industrial facilities, sewage treatment plants and septic systems, and animal manure from farms.",
    'phosphorus': "Phosphorus: Phosphorus pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Phosphorus often attaches to soil and sediment particles on land, entering the Bay many years later when stream banks erode or rainwater washes it into streams, rivers, and the Bay. Sources of phosphorus pollution include fertilizers from farmlands, lawns and golf courses, eroding soil and sediment from stream banks in urban and suburban neighborhoods, animal manure from farms, and wastewater from industrial facilities and sewage treatment plants.",
    'sediment': "Sediment: Maryland did not establish TMDL caps for sediments. Excess sediments - direct, clay, silt, and sand - hurt the Bay's water quality by blocking the sunlight needed by underwater plants and grasses. Without enough sunlight, these underwater grasses are not able to grow and provide habitat for young fish and blue crabs. In addition to blocking sunlight, sediment pollution can also carry nutrient and chemical contaminates into the bay, and smother oysters, underwater grasses and other bottom dwelling creatures."
  };
  this.changeDetails();
  this.addEvents();
  this.getSocrataStat();
  this.getPieStats();
}

Causes.prototype.changeDetails = function() {
  var pollution = $('#pollution input:checked').val();
  $('#details').html(this.details[pollution]);
}

Causes.prototype.addEvents = function() {
  var self = this;
  $('#pollution').change(function(){
    self.getPieStats();
    self.changeDetails();
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
    self.updateLabels();
    var data = self.prepareData(res);
    self.chart.update(data);
  });
}

Causes.prototype.updateLabels = function() {
  var stat = $('#source').val();
  var pollution = $('#pollution input:checked').val();
  var charttitle = 'The chart below shows how ' + pollution + ' pollution from ' + stat + ' in ' + this.map.selectedGeo + ' has changed over time';
  $('#line .title').html(charttitle);
  var capitalPollution = pollution.charAt(0).toUpperCase() + pollution.slice(1);
  var dashboardtitle = '<h5>' + this.map.selectedGeo + '</h5><p>' + capitalPollution + '</p>';
  $('#title').html(dashboardtitle);
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