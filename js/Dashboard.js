function Dashboard(){
  var self = this;
  this.stat = 'Cover Crops';
  this.geo = 'Maryland';
  this.map = new Map();
  this.chart = new Chart();
  this.addHandlers();
  this.chart.makeLineChart();
  this.loadData(function(){
    self.getSocrataStat(self.stat, self.geo);
  });
}

Dashboard.prototype.loadData = function(next){
  var self = this;
  $.getJSON('data/stats.json', function(res){
    self.statsData = res;
    next();
  });
}

Dashboard.prototype.getStats = function() {
  $.getJSON('api/bay/stats/', function(res){
    res.forEach(function(stat){
      console.log(stat);
    });
  });
}

Dashboard.prototype.getSocrataStat = function(stat, geo){
  var self = this;
  $('#line-chart .title').html('<h5>' + stat + ' (' + geo + ')</h5>');
  var def = _.where(self.statsData, {stat: stat})[0].definition;
  $('#notes .inner').html('<div class="def"><h6>Definition:</h6><p>' + def + '</p></div>');
  $.getJSON('api/bay/stat/' + stat + '/' + geo, function(res){
    self.chart.updateChart(res);
  });
}

Dashboard.prototype.addHandlers = function(){
  var self = this;
  $('a.stat').click(function(e){
    e.preventDefault();
    var stat = $(this).html();
    self.stat = $("<div/>").html(stat).text(); //decode
    self.getSocrataStat(self.stat, self.geo);
  });
}