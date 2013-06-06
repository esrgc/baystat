function Chart(){
  var self = this;
  this.margin = {top: 60, right: 20, bottom: 30, left: 60};
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
      .interpolate('monotone')
      .x(function(d) { return self.x(d.date); })
      .y(function(d) { return self.y(d.stat); });

  this.parseDate = d3.time.format("%Y").parse;

  this.emptyData = [{"_2006":"00","_2005":"0","_2004":"0","_2003":"0","_2009":"0","_2008":"0","_2007":"0","_2013_goal":"0","_2012":"0","_2013":"0","_2000":"0","_2010":"0","_2001":"0","_2011":"0","_2002":"0"}];

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

Chart.prototype.hoverOnDot = function(d, i){
  $('.hoverbox').css('left', 60 + this.x(d.date));
  $('.hoverbox').css('top', 70 + this.y(d.stat));
  $('.hoverbox').html(d.stat);
  $('.hoverbox').show();
}

Chart.prototype.hoverOffDot = function(d, i){
  $('.hoverbox').hide();
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
      .attr("r", 4)
      .attr("data", function(d){ return d.stat; })
      .on('mouseover', function(d, i) {self.hoverOnDot(d, i); })
      .on('mouseout', function(d, i) {self.hoverOffDot(d, i); })
      .attr("cx", function(d) { return self.x(d.date); })
      .attr("cy", function(d) { return self.y(d.stat); });

  var goaldot = [{
        date: self.parseDate('2013'),
        stat: chartData2[chartData2.length-1].stat
      }];

  svg.append("circle")
      .data(goaldot)
      .attr("class", "dot secondary")
      .attr("r", 4)
      .attr("data", function(d){ return d.stat; })
      .on('mouseover', function(d, i) {self.hoverOnDot(d, i); })
      .on('mouseout', function(d, i) {self.hoverOffDot(d, i); })
      .attr("cx", function(d) { console.log(d.date); return self.x(d.date); })
      .attr("cy", function(d) { return self.y(d.stat); });

}

Chart.prototype.updateChart = function(data) {
  var self = this,
      chartData = [],
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

}