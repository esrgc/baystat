function Dashboard(){
  var self = this;
  this.stat = 'Cover Crops';
  this.geo = 'Maryland';
  this.map = new Map();
  this.chart = new Chart();
  this.pie = new PieChart();
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
  self.chart.updateChart(self.chart.emptyData);
  $.getJSON('api/bay/stat/' + stat + '/' + geo, function(res){
    self.chart.updateLabels(stat, geo);
    self.chart.updateChart(res);
    self.addNotes(stat, res[0]);
  });
}

Dashboard.prototype.addHandlers = function(){
  var self = this;
  $('a.stat').click(function(e){  
    e.preventDefault();
    var stat = $(this).html();
    self.stat = $("<div/>").html(stat).text(); //decode
    $('a.stat').removeClass('active');
    $(this).addClass('active');
    self.getSocrataStat(self.stat, self.geo);
  });
}

Dashboard.prototype.addNotes = function(stat, data) {
  var self = this;
  var def = _.where(self.statsData, {stat: stat})[0].definition;
  $('.def').html('<h6>Definition:</h6><p>' + def + '</p>');
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
    var html = notelist;
    $('.notes').html(html);
    $('.notes').show();
  } else {
    $('.notes').hide();
  }
}