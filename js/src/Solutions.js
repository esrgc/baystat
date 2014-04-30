
var SolutionsModel = Backbone.Model.extend({
  defaults: {
    title: "Maryland's 2014 - 2015 Milestone Goals and Progress Report",
    stat: 'Cover Crops',
    geo: 'Maryland',
    zoom: 7,
    lat: 38.8,
    lng: -77.4,
    data: {},
    invalidGeoms: ['Youghiogheny', 'Christina River', 'Coastal Bays'],
    socrata_urls: {
      mda: 'https://data.maryland.gov/resource/tsya-25ee.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag',
      mde: 'https://data.maryland.gov/resource/ab68-n7ja.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag',
      dnr: 'https://data.maryland.gov/resource/4zqs-i2t2.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag'
    },
    agency: {
      'Cover Crops': 'mda',
      'Soil Conservation & Water Quality Plans': 'mda',
      'Stream Protection': 'mda',
      'Manure Management Structures': 'mda',
      'Natural Filters on Private Land': 'mda',
      'Wastewater Treatment Plants ENR': 'mde',
      'Stormwater Runoff Management Retrofits': 'mde',
      'Septic Retrofits': 'mde',
      'Air Pollution Reductions': 'mde',
      'Natural Filters on Public Land': 'dnr',
      'Program Open Space': 'dnr',
      'CREP Permanent Easements': 'dnr',
      'Rural Legacy': 'dnr',
      'Maryland Environmental Trust': 'dnr',
      'Maryland Agricultural Land Preservation': 'dnr'
    },
    request: null,
    start_year: 2000,
    end_year: 2014,
    reduction: {
      urban: 0,
      farms: 0,
      publicland: 0
    }
  },
  getBMPStatistics: function(_geo, _stat){
    if(this.get('request')) {
      this.get('request').abort();
    }
    
    var geo = encodeURIComponent(_geo),
        stat = encodeURIComponent(_stat);

    var agency = this.get('agency')[_stat]
    var url = this.get('socrata_urls')[agency]
      + "&$where=basin_name='"+geo+"'%20and%20best_management_practice='"+stat+"'";

    var request = $.ajax({
      dataType: "jsonp",
      jsonp: false,
      url: url + '&$jsonp=BayStat.Solutions.receiveData'
    });

    this.set("request", request);
  },
  getPieData: function() {
    this.set('reduction', {
      urban: 265705,
      agriculture: 1140357,
      filters: 36330
    })
    // var url = this.get('socrata_urls')['mde']
    //   + "&$where=basin_name='Maryland'&$select=sum(_2015_goal)%20as%20goal";
    // var request = $.ajax({
    //   dataType: "jsonp",
    //   jsonp: false,
    //   url: url + '&$jsonp=BayStat.Solutions.receiveGoalUrban'
    // });

    // var url = this.get('socrata_urls')['dnr']
    //   + "&$where=basin_name='Maryland'&$select=sum(_2015_goal)%20as%20goal";
    // var request = $.ajax({
    //   dataType: "jsonp",
    //   jsonp: false,
    //   url: url + '&$jsonp=BayStat.Solutions.receiveGoalPublic'
    // });

    // var url = this.get('socrata_urls')['mda']
    //   + "&$where=basin_name='Maryland'&$select=sum(_2015_goal)%20as%20goal";
    // var request = $.ajax({
    //   dataType: "jsonp",
    //   jsonp: false,
    //   url: url + '&$jsonp=BayStat.Solutions.receiveGoalFarms'
    //});
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
    this.listenTo(this.model, "change:reduction", this.updatePieChart);
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
    this.model.getPieData()
  },
  makeCharts: function(){
    this.chart = new GeoDash.LineChart("#line-chart .chart", {
      x: 'date',
      y: ['stat', 'goal'],
      colors: ['#d80000', '#006200'],
      opacity: 0.6,
      interpolate: 'monotone',
      yLabel: 'Acres',
      xTickFormat: d3.time.format("'%y"),
      yTickFormat: d3.format('.3s'),
      yAxisWidth: 30,
      yaxisLabelPadding: 50,
      hoverTemplate: '{{y}}',
      valueFormat: d3.format(",.0f"),
      margin: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
    this.pie = new GeoDash.PieChart('#pie .chart', {
      label: 'source',
      value: 'percent',
      colors: ["#0B6909", "#d80000", "#f0db4f"],
      innerRadius: 0,
      arcstrokewidth: 1,
      arcstrokecolor: '#555',
      opacity: 0.8,
      legend: true,
      legendWidth: 100,
      hoverTemplate: "{{label}}: {{value}} TN Reduction ({{percent}}%)"
    });
  },
  updatePieChart: function() {
    var reduction = this.model.get('reduction')
    this.pie.update([
      {"source":"Public Lands","percent":reduction.filters},
      {"source":"Urban Areas","percent": reduction.urban},
      {"source":"Farming Practices","percent":reduction.agriculture}
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
      this.model.getBMPStatistics(this.model.get('geo'), this.model.get('stat'));
    }
  },
  receiveGoalUrban: function(data){
    var reduction = this.model.get('reduction')
    reduction.urban = data[0].goal
    this.model.set('reduction', reduction)
    this.updatePieChart()
  },
  receiveGoalFarms: function(data){
    var reduction = this.model.get('reduction')
    reduction.farms = data[0].goal
    this.model.set('reduction', reduction)
    this.updatePieChart()
  },
  receiveGoalPublic: function(data){
    var reduction = this.model.get('reduction')
    reduction.publicland = data[0].goal
    this.model.set('reduction', reduction)
    this.updatePieChart()
  },
  receiveData: function(data){
    var self = this;
    $('.loader').css('opacity', '0');
    self.updateLabels(data);
    self.addNotes(data[0]);
    self.model.set({data: data[0]});
    var _data = self.prepareData(data[0]);
    self.chart.update(_data);
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
    if(_.has(data, "_2015_goal")) {
      goal = +data["_2015_goal"].replace(",", "").replace("*", "");
      this.chart.options.y = ['stat', 'goal']
    } else {
      goal = 0;
      this.chart.options.y = ['stat']
    }
    var max = 0;
    for(var i = this.model.get('start_year'); i <= this.model.get('end_year'); i++) {
      var year = "_" + i, stat = null;
      if(data[year] !== undefined) {
        stat = +data[year].replace(",", "").replace("*", "");
        if(stat > max) max = stat
        chartData.push({
          date: parseDate(i.toString()),
          stat: stat,
          goal: goal
        });
      } else {
        stat = 0
      }
    }
    var yaxisLabelPadding = this.chart.options.yaxisLabelPadding
    if(max < 100 && max > 0){
      yaxisLabelPadding = 15
    } else if(max > 100 && max < 9000){
      yaxisLabelPadding = 30
    } else if(max >= 9000){
      yaxisLabelPadding = 40
    }
    if(max < 10 && max > 0){
      this.chart.options.yTicksCount = max
    } else if (max > 10) {
      this.chart.options.yTicksCount = 10
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
    this.chart.options.hoverTemplate = '{{y}} ' + units_abbr;
    this.chart.setYAxisLabel(units_abbr);
    if(_.has(data[0], "_2015_goal")) {
      var overlaytext = '<p>2014: ' + this.formatComma(+data[0]['_2014'].replace(",", "").replace("*", "")) + '</p>';
      overlaytext += '<p>2015 Goal: ' + this.formatComma(+data[0]["_2015_goal"].replace(",", "").replace("*", "")) + '</p>';
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
