function Chart(){
  var self = this;
  this.margin = {top: 50, right: 20, bottom: 30, left: 50};
  this.width = 500 - this.margin.left - this.margin.right;
  this.height = 255 - this.margin.top - this.margin.bottom;
  this.dotRadius = 3;

  this.x = d3.time.scale()
      .range([0, this.width]);

  this.y = d3.scale.linear()
      .range([this.height, 0]);

  this.xAxis = d3.svg.axis()
      .scale(this.x)
      .tickSize(this.height*-1)
      .orient("bottom");

  this.yAxis = d3.svg.axis()
      .scale(this.y)
      .tickSize(this.width*-1)
      .orient("left");

  this.line = d3.svg.line()
      .interpolate('monotone')
      .x(function(d) { return self.x(d.date); })
      .y(function(d) { return self.y(d.stat); });

  this.parseDate = d3.time.format("%Y").parse;
  this.formatComma = d3.format(",");

  this.emptyData = [{"_2006":"00","_2005":"0","_2004":"0","_2003":"0","_2009":"0","_2008":"0","_2007":"0","_2013_goal":"0","_2012":"0","_2013":"0","_2000":"0","_2010":"0","_2001":"0","_2011":"0","_2002":"0"}];
}

Chart.prototype.setDomain = function(d1, d2){
  var extent = d3.extent(d1, function(d) { return d.stat; });
  var extent2 = d3.extent(d2, function(d) { return d.stat; });
  if(extent2[1] > extent[1]) extent[1] = extent2[1];
  extent[1] = extent[1] + extent[1]*.2;
  extent[0] = extent[0] - extent[0]*.2;
  if(extent[0] < 0) extent[0] = 0;
  this.x.domain(d3.extent(d1, function(d) { return d.date; }));
  this.y.domain(extent);
}

Chart.prototype.hoverOnDot = function(d, i, dot){
  var stat = this.formatComma(d.stat);
  var x = 55 + this.x(d.date);
  var y = 45 + this.y(d.stat);
  d3.select(dot).transition().attr('r', this.dotRadius + 3);
  
  //get width of x-axis, so labels don't go off the edge
  var w = $('.line.primary').get(0).getBBox().width;
  if(this.x(d.date) >= w) x -= 55;

  $('.hoverbox').css('left', x);
  $('.hoverbox').css('top', y);
  $('.hoverbox').html(stat);
  $('.hoverbox').fadeIn(200);
}

Chart.prototype.hoverOffDot = function(d, i, dot){
  $('.hoverbox').fadeOut(200);
  d3.select(dot).transition().attr('r', this.dotRadius);
}

Chart.prototype.updateLabels = function(stat, geo){
  $('#line-chart .title').html('<h5>' + stat + ' (' + geo + ')</h5>');
  var units = _.where(dashboard.statsData, {stat: stat})[0].units;
  $('.units').html(units);
}

Chart.prototype.makeLineChart = function(){
  var self = this,
      chartData = [],
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
      .attr("transform", "translate(0," + (this.height) + ")")
      .call(this.xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis);

  svg.append("path")
      .datum(chartData2)
      .attr("class", "line secondary")
      .attr("d", this.line);

  svg.append("path")
      .datum(chartData)
      .attr("class", "line primary")
      .attr("d", this.line);

  svg.selectAll(".dot")
      .data(chartData)
    .enter().append("circle")
      .attr("class", "dot primary")
      .attr("r", this.dotRadius)
      .attr("data", function(d){ return d.stat; })
      .on('mouseover', function(d, i) {self.hoverOnDot(d, i, this); })
      .on('mouseout', function(d, i) {self.hoverOffDot(d, i, this); })
      .attr("cx", function(d) { return self.x(d.date); })
      .attr("cy", function(d) { return self.y(d.stat); });

  var goaldot = [{
        date: self.parseDate('2013'),
        stat: chartData2[chartData2.length-1].stat
      }];

  svg.append("circle")
      .data(goaldot)
      .attr("class", "dot secondary")
      .attr("r", this.dotRadius)
      .attr("data", function(d){ return d.stat; })
      .on('mouseover', function(d, i) {self.hoverOnDot(d, i, this); })
      .on('mouseout', function(d, i) {self.hoverOffDot(d, i, this); })
      .attr("cx", function(d) { return self.x(d.date); })
      .attr("cy", function(d) { return self.y(d.stat); });

}

Chart.prototype.updateChart = function(data) {
  var self = this,
      chartData = [],
      chartData2 = [];

  for(var i = 2000; i <= 2013; i++) {
    var year = "_" + i, stat;
    if(data[0][year].indexOf("NULL") >= 0) {
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

  svg.select(".x.axis").transition()
    .call(this.xAxis);

  var delay = function(d, i) { return i * 10; }

  svg.select(".line.primary")
    .datum(chartData)
    .transition().duration(500).delay(delay)
    .attr("d", this.line);

  svg.select(".line.secondary")
    .datum(chartData2)
    .transition().duration(500).delay(delay)
    .attr("d", this.line);

  svg.selectAll(".dot.primary")
      .data(chartData)
      .transition().duration(500).delay(delay)
      .attr("data", function(d){ return d.stat; })
      .attr("cx", function(d) { return self.x(d.date); })
      .attr("cy", function(d) { return self.y(d.stat); });

  var goaldot = [{
        date: self.parseDate('2013'),
        stat: chartData2[chartData2.length-1].stat
      }];

  svg.selectAll(".dot.secondary")
      .data(goaldot)
      .transition().duration(500).delay(delay)
      .attr("data", function(d){ return d.stat; })
      .attr("cx", function(d) { return self.x(d.date); })
      .attr("cy", function(d) { return self.y(d.stat); });

  var overlaytext = '<p>2013: ' + this.formatComma(chartData[chartData.length-1].stat) + '</p>';
  overlaytext += '<p>2013 Goal: ' + this.formatComma(chartData2[0].stat) + '</p>';
  $('.overlay').html(overlaytext);

}