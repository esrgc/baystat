var Solutions = Backbone.Model.extend({
  defaults: {
    stat: 'Cover Crops',
    geo: 'Maryland',
    zoom: 7,
    lat: 39,
    lng: -77.4
  }
});
var solutions = new Solutions();

var MenuView = Backbone.View.extend({
  events: {
    "click .stat": "setStat"
  },
  template: _.template($('#menu-template').html()),
  initialize: function() {

  },
  render: function(){
     this.$el.html(this.template(this.model.toJSON()));
     return this;
  },
  setStat: function(e) {
    var $target = $(e.target);
    var stat = $target.html();
    stat = $("<div/>").html(stat).text(); //decode
    this.model.set({stat: stat});
    $('a.stat').removeClass('active');
    $target.addClass('active');
  }
});

var SolutionsView = Backbone.View.extend({
  events: {
    "click .state": "goToState"
  },
  template: _.template($('#solutions-template').html()),
  initialize: function() {
    this.listenTo(this.model, "change", this.getSocrataStat);
    var self = this;
    this.formatComma = d3.format(",");
    this.emptyData = this.prepareData([{"_2006":"0","_2005":"0","_2004":"0","_2003":"0","_2009":"0","_2008":"0","_2007":"0","_2013_goal":"0","_2012":"0","_2013":"0","_2000":"0","_2010":"0","_2001":"0","_2011":"0","_2002":"0"}]);
    this.render();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    var view = new MenuView({model: solutions});
    $("#menu .inner").html(view.render().el);
    this.map = new MapView({model: solutions});
    this.makeCharts();
    this.loadData();
  },
  loadData: function(){
    var self = this;
    $.getJSON('data/stats.json', function(res){
      self.statsData = res;
      self.getSocrataStat();
    });
  },
  makeCharts: function(){
    this.chart = new GeoDash.LineChart("#line-chart .chart", {
      x: 'date',
      y: 'stat',
      width: 'auto',
      height: 'auto',
      colors: ['#d80000', '#006200'],
      interpolate: 'monotone'
    });
    this.pie = new GeoDash.PieChart('#pie .chart', {
      label: 'source',
      value: 'percent',
      colors: ["#d80000", "#0B6909", "#f0db4f"],
      innerRadius: 1,
      drawX: false,
      drawY: false,
      opacity: 0.8,
      legend: '#pie .legend'
    });
    this.pie.update([
      {"source":"Urban/Suburban","percent":50},
      {"source":"Public Land","percent":4},
      {"source":"Farms","percent":46}
    ]);
  },
  getStats: function() {
    $.getJSON('api/bay/stats/', function(res){
      res.forEach(function(stat){
        console.log(stat);
      });
    });
  },
  getSocrataStat: function(){
    var self = this;
    self.chart.update(self.emptyData);
    $.getJSON('api/bay/stat/solutions/' + self.model.get('stat') + '/' + self.model.get('geo'), function(res){
      self.updateLabels(res);
      self.addNotes(res[0]);
      var data = self.prepareData(res);
      console.log(JSON.stringify(data));
      self.chart.update(data);
    });
  },
  prepareData: function(data) {
    var chartData = [];
    var parseDate = d3.time.format("%Y").parse;
    for(var i = 2000; i <= 2013; i++) {
      var year = "_" + i, stat;
      if(data[0][year] === undefined) {
        
        stat = 0;
      } else {
        stat = +data[0][year].replace(",", "").replace("*", "");
      }
      chartData.push({
        date: parseDate(i.toString()),
        stat: stat
      });
      if(_.has(data[0], "_2013_goal")) {
        _.each(chartData, function(el, idx){
          chartData[idx]['goal'] = +data[0]["_2013_goal"].replace(",", "").replace("*", "");
        });
      }
    }
    return chartData;
  },
  updateLabels: function(data){
    var self = this;
    $('#line-chart .title').html('<h5>' + self.model.get('stat') + ' (' + self.model.get('geo') + ')</h5>');
    var units = _.where(dashboard.statsData, {stat: self.model.get('stat')})[0].units;
    $('.units').html(units);
    if(_.has(data[0], "_2013_goal")) {
      var overlaytext = '<p>2013: ' + this.formatComma(+data[0]['_2013'].replace(",", "").replace("*", "")) + '</p>';
      overlaytext += '<p>2013 Goal: ' + this.formatComma(+data[0]["_2013_goal"].replace(",", "").replace("*", "")) + '</p>';
      $('.overlay').html(overlaytext);
    } else {
      $('.overlay').html('');
    }
  },
  setStat: function(e){
    console.log('lol');
    var self = this;
    var $target = $(e.target);
    var stat = $target.html();
    self.stat = $("<div/>").html(stat).text(); //decode
    $('a.stat').removeClass('active');
    $(this).addClass('active');
    self.getSocrataStat(self.stat, self.geo);
    return false;
  },
  goToState: function(e){
    console.log('asdf');
    this.map.geojsonlayer.setStyle(this.map.style);
    this.model.set({geo: 'Maryland'});
    return false;
  },
  addNotes: function(data) {
    var self = this;
    var def = _.where(self.statsData, {stat: self.model.get('stat')})[0].definition;
    $('.def').html('<h6>Definition:</h6><p>' + def + '</p>');
    if(data.footnote) {
      $('.rednote').html('<p>' + data.footnote + '</p>');
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
});
