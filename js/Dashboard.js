function Dashboard(){
  this.stat = 'Cover Crops';
  this.geo = 'Maryland';
  this.map = new Map();
  this.chart = new Chart();
  this.addHandlers();
  this.chart.makeLineChart();
  this.getSocrataStat(this.stat, this.geo);
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
  $.getJSON('api/bay/stat/' + stat + '/' + geo, function(res){
    self.chart.updateChart(res);
  });
}

Dashboard.prototype.addHandlers = function(){
  $('a.stat').click(function(e){
    e.preventDefault();
    var stat = $(this).html();
    dashboard.stat = $("<div/>").html(stat).text(); //decode
    dashboard.getSocrataStat(dashboard.stat, dashboard.geo);
  });
}