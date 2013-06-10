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
  self.chart.updateChart(self.chart.emptyData);
  var def = _.where(self.statsData, {stat: stat})[0].definition;
  var units = _.where(self.statsData, {stat: stat})[0].units;
  $('.units').html(units);
  $('#notes .inner').html('<div class="def"><h6>Definition:</h6><p>' + def + '</p></div>');
  $.getJSON('api/bay/stat/' + stat + '/' + geo, function(res){
    console.log(JSON.stringify(res));
    self.chart.updateChart(res);
    self.addNotes(res[0]);
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

Dashboard.prototype.addNotes = function(data) {
  if(data.red_footnote) {
    $('.rednote').html(data.red_footnote);
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
  }
  var html = '<div class="notes">'+notelist+'</div>';
  $('#notes .inner').append(html);
}