function Chart(){
  var self = this;
  this.margin = {top: 20, right: 20, bottom: 30, left: 60};
  this.width = 500 - this.margin.left - this.margin.right;
  this.height = 255 - this.margin.top - this.margin.bottom;

  this.x = d3.time.scale()
      .range([0, this.width]);

  this.y = d3.scale.linear()
      .range([this.height, 0]);

  this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

  this.yAxis = d3.svg.axis()
      .scale(this.y)
      .tickSize(this.width*-1)
      .orient("left");

  this.line = d3.svg.line()
      .interpolate('basis')
      .x(function(d) { return self.x(d.date); })
      .y(function(d) { return self.y(d.stat); });

  this.parseDate = d3.time.format("%Y").parse;

  this.setDomain = function(d1, d2) {
    var extent = d3.extent(d1, function(d) { return d.stat; });
    var extent2 = d3.extent(d2, function(d) { return d.stat; });
    if(extent2[1] > extent[1]) extent[1] = extent2[1];
    extent[1] = extent[1] + extent[1]*.2;
    extent[0] = extent[0] - extent[0]*.2;
    if(extent[0] < 0) extent[0] = 0;
    this.x.domain(d3.extent(d1, function(d) { return d.date; }));
    this.y.domain(extent);
  }
}

Chart.prototype.makeLineChart = function(){
  var chartData = [],
      chartData2 = [];

  for(var i = 2000; i <= 2013; i++) {
    chartData.push({
      date: this.parseDate(i.toString()),
      stat: 0
    });
    chartData2.push({
      date: this.parseDate(i.toString()),
      stat: 0
    });
  }
  this.setDomain(chartData, chartData2);

  var svg = d3.select("#line-chart .chart").append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis);
    // .append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 6)
    //   .attr("dy", ".71em")
    //   .style("text-anchor", "end")
    //   .text("Cover Crops (acres)");

  svg.append("path")
      .datum(chartData)
      .attr("class", "line")
      .attr("d", this.line);

  svg.append("path")
      .datum(chartData2)
      .attr("class", "line secondary")
      .attr("d", this.line);

}

Chart.prototype.updateChart = function(data) {
  var chartData = [],
      chartData2 = [];

  for(var i = 2000; i <= 2013; i++) {
    var year = "_" + i, stat;
    if(data[0][year] === '#NULL!') {
      stat = 0;
    } else {
      stat = +data[0][year].replace(",", "").replace("*", "");
    }
    chartData.push({
      date: this.parseDate(i.toString()),
      stat: stat
    });
    chartData2.push({
      date: this.parseDate(i.toString()),
      stat: +data[0]["_2013_goal"].replace(",", "").replace("*", "")
    });
  }
  this.setDomain(chartData, chartData2);

  var svg = d3.select("#line-chart > .chart > svg > g");

  svg.select(".y.axis").transition()
    .call(this.yAxis);

  // svg.select(".y.axis > text")
  //     .text(data[0].bmpname2);

  svg.select(".x.axis").transition()
    .call(this.xAxis);

  var delay = function(d, i) { return i * 50; }
  svg.select(".line")
    .datum(chartData)
    .transition().duration(750).delay(delay)
    .attr("d", this.line);

  svg.select(".line.secondary")
    .datum(chartData2)
    .transition().duration(750).delay(delay)
    .attr("d", this.line);
}