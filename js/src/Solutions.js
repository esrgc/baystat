var SolutionsModel = Backbone.Model.extend({
  defaults: {
    title: "Maryland's 2012 - 2013 Milestone Goals and Progress Report",
    stat: 'Cover Crops',
    geo: 'Maryland',
    zoom: 7,
    lat: 38.8,
    lng: -77.4,
    data: {},
    invalidGeoms: ['Youghiogheny', 'Christina River', 'Coastal Bays'],
    solutions_url: 'https://data.maryland.gov/resource/8nvv-y5u6.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag',
    request: null
  },
  getBMPStatistics: function(_geo, _stat, next){
    if(this.get('request')) {
      this.get('request').abort();
    }
    var geo = encodeURIComponent(_geo),
        stat = encodeURIComponent(_stat);
    var url = this.get('solutions_url') + "&$where=basinname='"+geo+"'%20and%20bmpname='"+stat+"'";
    var request = $.getJSON(url, function(json){
      next(json);
    });
    this.set("request", request);
  }
});

var MenuView = Backbone.View.extend({
  events: {
    "click .stat": "setStat"
  },
  template: BayStat.templates["templates/solutions-menu-template.handlebars"],
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
  el: '.dashboard',
  events: {
    "click .state": "goToState"
  },
  template: BayStat.templates["templates/solutions-template.handlebars"],
  initialize: function() {
    this.listenTo(this.model, "change:stat", this.updateLineChart);
    this.listenTo(this.model, "change:geo", this.updateLineChart);
    this.formatComma = d3.format(",");
    this.render();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    var view = new MenuView({model: this.model});
    $("#menu .inner").html(view.render().el);
    this.map = new MapView({model: this.model});
    this.makeCharts();
    this.loadData();
  },
  loadData: function(){
    var self = this;
    $.getJSON('data/stats.json', function(res){
      self.statsData = res;
      self.updateLineChart();
    });
  },
  makeCharts: function(){
    this.chart = new GeoDash.LineChart("#line-chart .chart", {
      x: 'date',
      y: 'stat',
      width: 'auto',
      height: 'auto',
      colors: ['#d80000', '#006200'],
      interpolate: 'monotone',
      axisLabels: true,
      yAxisLabel: ''
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
  updateLineChart: function(){
    var self = this;
    if(_.isEmpty(this.model.get('data')) == false) {
      var empty = this.makeEmptyData();
      this.chart.update(empty);
    }
    if(_.contains(this.model.get('invalidGeoms'), this.model.get('geo'))) {
      this.updateLabels([{}]);
      this.addNotes([{}]);
      var empty = this.makeEmptyData();
      $('.loader').css('opacity', '0');
      this.chart.update(empty);
    } else {
    $('.loader').css('opacity', '1');
    this.model.getBMPStatistics(this.model.get('geo'), this.model.get('stat'), function(res){
      $('.loader').css('opacity', '0');
      self.updateLabels(res);
      self.addNotes(res[0]);
      self.model.set({data: res[0]});
      var data = self.prepareData(res[0]);
      self.chart.update(data);
    });
    }
  },
  makeEmptyData: function() {
    var data = this.model.get('data');
    var keys = _.keys(data);
    _.each(keys, function(key, idx){
      data[key] = "0";
    });
    return this.prepareData(data);
  },
  prepareData: function(data) {
    var chartData = [];
    var parseDate = d3.time.format("%Y").parse;
    for(var i = 2000; i <= 2013; i++) {
      var year = "_" + i, stat;
      if(data[year] === undefined) {
        stat = null;
      } else {
        stat = +data[year].replace(",", "").replace("*", "");
        chartData.push({
          date: parseDate(i.toString()),
          stat: stat
        });
      }
    }
    var idx = 0;
    for(var year = 2000; year <= 2013; year++) {
      var goal;
      if(_.has(data, "_2013_goal")) {
        goal = +data["_2013_goal"].replace(",", "").replace("*", "");
      } else {
        goal = 0;
      }
      if(chartData[idx]) {
        chartData[idx]['goal'] = goal;
      } else {
        chartData.push({
          date: parseDate(year.toString()),
          goal: goal
        });
      }
      idx++;
    }
    return chartData;
  },
  updateLabels: function(data){
    var self = this;
    var charttitle = self.model.get('stat') + ': ' + self.model.get('geo') + '';
    if(_.contains(self.model.get('invalidGeoms'), self.model.get('geo'))) {
      charttitle = '<span class="text-danger">Not in Bay watershed</span> (' + self.model.get('geo') + ' watershed)';
    }
    $('#line-chart .panel-heading').html('<h5>' + charttitle + '</h5>');
    var units = _.where(self.statsData, {stat: self.model.get('stat')})[0].units;
    $('.units').html(units);
    var units_abbr = _.where(self.statsData, {stat: self.model.get('stat')})[0].units_abbr;
    this.chart.setYAxisLabel(units_abbr);
    if(_.has(data[0], "_2013_goal")) {
      var overlaytext = '<p>2013: ' + this.formatComma(+data[0]['_2013'].replace(",", "").replace("*", "")) + '</p>';
      overlaytext += '<p>2013 Goal: ' + this.formatComma(+data[0]["_2013_goal"].replace(",", "").replace("*", "")) + '</p>';
      $('.overlay').html(overlaytext);
    } else {
      $('.overlay').html('');
    }
  },
  goToState: function(e){
    this.map.geojsonlayer.setStyle(this.map.style);
    this.model.set({geo: 'Maryland'});
    return false;
  },
  addNotes: function(data) {
    var self = this;
    var def = _.where(self.statsData, {stat: self.model.get('stat')})[0].definition;
    $('.def > .content').html('<p>' + def + '</p>');
    if(data.footnote) {
      $('.rednote').html('<p>' + data.footnote + '</p>');
    } else {
      $('.rednote').html('');
    }
    var notelist = '';
    if(data.note1) {
      notelist += '<ul>';
      notelist += '<li>' + data.note1 + '</li>';
      if(data.note2) {
        notelist += '<li>' + data.note2 + '</li>';
      }
      if(data.note3) {
        notelist += '<li>' + data.note3 + '</li>';
      }
      notelist += '</ul>';
      var html = notelist;
      $('.notes > .content').html(html);
      $('.notes').show();
    } else {
      $('.notes').hide();
    }
  }
});
