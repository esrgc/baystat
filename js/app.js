$(document).ready(function(){

  var map = new L.Map('map', {
    minZoom: 7
  }).setView(new L.LatLng(38.85, -77.4), 7);
  var baseURL = 'http://a.tiles.mapbox.com/v3/esrgc.map-y9awf40v/{z}/{x}/{y}.png';
  var countyURL = 'http://a.tiles.mapbox.com/v3/esrgc.CountyCompare/{z}/{x}/{y}.png';

  L.tileLayer(baseURL, {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.tileLayer(countyURL).addTo(map);

  map.setMaxBounds(map.getBounds());

  makeLineChart();
  var stat = 'Cover Crops';
  var geo = 'Maryland';
  getSocrataStat(stat, geo);

  $('a.stat').click(function(e){
    e.preventDefault();
    var stat = $(this).html();
    stat = $("<div/>").html(stat).text(); //decode
    getSocrataStat(stat, geo);
  });

});

function getStats() {
  $.getJSON('api/bay/stats/', function(res){
    res.forEach(function(stat){
      console.log(stat);
    });
  });
}

function getSocrataStat(stat, geo){
  //$('#line-chart').html('loading...');
  $('#line-chart .title').html('<h5>' + stat + ' (' + geo + ')</h5>');
  $.getJSON('api/bay/stat/' + stat + '/' + geo, function(res){
    updateChart(res);
  });
}

function updateChart(data) {
  var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = 500 - margin.left - margin.right,
    height = 255 - margin.top - margin.bottom;
  var parseDate = d3.time.format("%Y").parse;
  var chartData = [];
  var chartData2 = [];
  console.log(data);

  for(var i = 2000; i <= 2013; i++) {
    var year = "_" + i, stat;
    if(data[0][year] === '#NULL!') {
      stat = 0;
    } else {
      stat = +data[0][year].replace(",", "").replace("*", "");
    }
    chartData.push({
      date: parseDate(i.toString()),
      stat: stat
    });
    chartData2.push({
      date: parseDate(i.toString()),
      stat: +data[0]["_2013_goal"].replace(",", "").replace("*", "")
    });
  }

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .tickSize(width*-1)
      .orient("left");

  var line = d3.svg.line()
      .interpolate('basis')
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.stat); });

  var extent = d3.extent(chartData, function(d) { return d.stat; });
  var extent2 = d3.extent(chartData2, function(d) { return d.stat; });
  if(extent2[1] > extent[1]) extent[1] = extent2[1];
  extent[1] = extent[1] + extent[1]*.2;
  extent[0] = extent[0] - extent[0]*.2;
  if(extent[0] < 0) extent[0] = 0;
  x.domain(d3.extent(chartData, function(d) { return d.date; }));
  y.domain(extent);

  var svg = d3.select("#line-chart > .chart > svg > g");

  svg.select(".y.axis").transition()
    .call(yAxis);

  // svg.select(".y.axis > text")
  //     .text(data[0].bmpname2);

  svg.select(".x.axis").transition()
    .call(xAxis);

  var delay = function(d, i) { return i * 50; }
  svg.select(".line")
    .datum(chartData)
    .transition().duration(750).delay(delay)
    .attr("d", line);

  svg.select(".line.secondary")
    .datum(chartData2)
    .transition().duration(750).delay(delay)
    .attr("d", line);
}

function makeLineChart(){
  var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = 500 - margin.left - margin.right,
    height = 255 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y").parse;
  var chartData = [];
  var chartData2 = [];

  for(var i = 2000; i <= 2013; i++) {
    chartData.push({
      date: parseDate(i.toString()),
      stat: 0
    });
    chartData2.push({
      date: parseDate(i.toString()),
      stat: 0
    });
  }

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .tickSize(width*-1)
      .orient("left");

  var line = d3.svg.line()
      .interpolate('basis')
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.stat); });

  var svg = d3.select("#line-chart .chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var extent = d3.extent(chartData, function(d) { return d.stat; });
  var extent2 = d3.extent(chartData2, function(d) { return d.stat; });
  if(extent2[1] > extent[1]) extent[1] = extent2[1];
  extent[1] = extent[1] + extent[1]*.2;
  x.domain(d3.extent(chartData, function(d) { return d.date; }));
  y.domain(extent);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    // .append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 6)
    //   .attr("dy", ".71em")
    //   .style("text-anchor", "end")
    //   .text("Cover Crops (acres)");

  svg.append("path")
      .datum(chartData)
      .attr("class", "line")
      .attr("d", line);

  svg.append("path")
      .datum(chartData2)
      .attr("class", "line secondary")
      .attr("d", line);

}