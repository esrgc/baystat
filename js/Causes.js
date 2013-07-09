var Causes = Backbone.Model.extend({
  defaults: {
    geo: 'Maryland',
    source: '',
    pollution: '',
    zoom: 8,
    lat: 38.77121,
    lng: -77.31628,
    pollutionlist: ['Nitrogen', 'Phosphorus', 'Sediment'],
    sourcelist: [
      'All Sources',
      'Agriculture',
      'Forest',
      'Non-Tidal Atm',
      'Septic',
      'Stormwater',
      'Wastewater'
    ]
  },
  initialize: function(){
    this.set({pollution: this.get('pollutionlist')[0]});
    this.set({source: this.get('sourcelist')[0]});
  }
});
var causes = new Causes();

var PollutionMenuView = Backbone.View.extend({
  events: {
    "change #pollution": "setPollution"
  },
  template: _.template($('#pollution-menu-template').html()),
  initialize: function() {

  },
  render: function(){
     this.$el.html(this.template(this.model.toJSON()));
     return this;
  },
  setPollution: function(e) {
    var $target = $(e.target);
    var pollution = $('#pollution input:checked').val();
    this.model.set({pollution: pollution});
  }
});

var SourceMenuView = Backbone.View.extend({
  events: {
    "change #source": "setSource"
  },
  template: _.template($('#source-menu-template').html()),
  initialize: function() {

  },
  render: function(){
     this.$el.html(this.template(this.model.toJSON()));
     return this;
  },
  setSource: function(e) {
    var $target = $(e.target);
    var source = $('#source').val();
    this.model.set({source: source});
  }
});

var CausesView = Backbone.View.extend({
  events: {
    
  },
  initialize: function() {
    this.listenTo(this.model, "change", this.getSocrataStat);
    this.listenTo(this.model, "change:pollution", this.getPieStats);
    var self = this;
    this.formatComma = d3.format(",");
    this.details = {
      'Nitrogen': "Nitrogen: Nitrogen pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Sources of nitrogen pollution include air pollution from vehicles, coal-burning power plants and industry, fertilizers from farm fields, lawns and golf courses, wastewater from industrial facilities, sewage treatment plants and septic systems, and animal manure from farms.",
      'Phosphorus': "Phosphorus: Phosphorus pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Phosphorus often attaches to soil and sediment particles on land, entering the Bay many years later when stream banks erode or rainwater washes it into streams, rivers, and the Bay. Sources of phosphorus pollution include fertilizers from farmlands, lawns and golf courses, eroding soil and sediment from stream banks in urban and suburban neighborhoods, animal manure from farms, and wastewater from industrial facilities and sewage treatment plants.",
      'Sediment': "Sediment: Maryland did not establish TMDL caps for sediments. Excess sediments - direct, clay, silt, and sand - hurt the Bay's water quality by blocking the sunlight needed by underwater plants and grasses. Without enough sunlight, these underwater grasses are not able to grow and provide habitat for young fish and blue crabs. In addition to blocking sunlight, sediment pollution can also carry nutrient and chemical contaminates into the bay, and smother oysters, underwater grasses and other bottom dwelling creatures."
    };
    this.render();
    this.getSocrataStat();
    this.getPieStats();
  },
  render: function() {
    var view = new PollutionMenuView({model: causes});
    $("#pollution-menu").html(view.render().el);
    var view = new SourceMenuView({model: causes});
    $("#source-menu").html(view.render().el);
    var map = new MapView({model: causes});
    this.makeCharts();
  },
  makeCharts: function(){
    this.chart = new GeoDash.LineChart("#line .chart", {
      x: 'date',
      y: 'stat',
      width: 'auto',
      height: 'auto',
      colors: ['#d80000', '#006200'],
      interpolate: 'linear'
    });
    this.pie = new GeoDash.PieChart('#pie .chart', {
      label: 'sourcesector',
      value: 'sum_2012',
      colors: ["#d80000", "#0B6909", "#f0db4f", "#66adda", "#ff6600", "#a882c5"],
      innerRadius: 1,
      drawX: false,
      drawY: false,
      opacity: 0.7,
      legend: '#pie .legend'
    });
  },
  getPieStats: function() {
    var self = this;
    $.getJSON('api/bay/stat/sources/' + self.model.get('pollution'), function(res){
      self.pie.update(res);
    });
  },
  getSocrataStat: function(){
    var self = this;
    $.getJSON('api/bay/stat/causes/' + self.model.get('pollution') + '/' + self.model.get('source') + '/' + self.model.get('geo'), function(res){
      self.updateLabels();
      var data = self.prepareData(res);
      self.chart.update(data);
    });
  },
  updateLabels: function() {
    var self = this;
    var charttitle = 'The chart below shows how ' + self.model.get('pollution') + ' pollution from ' + self.model.get('source') + ' in ' + self.model.get('geo') + ' has changed over time';
    $('#line .title').html(charttitle);
    var pollution = self.model.get('pollution');
    var capitalPollution = pollution.charAt(0).toUpperCase() + pollution.slice(1);
    var dashboardtitle = '<h5>' + self.model.get('geo') + '</h5><p>' + capitalPollution + '</p>';
    $('#title').html(dashboardtitle);
    $('#details').html(this.details[pollution]);
  },
  prepareData: function(data) {
    var chartData = [];
    var milestone = data[0]["milestone2013"];
    var parseDate = d3.time.format("%Y").parse;
    for(var i = 0; i < data.length; i++){
      var years = _.omit(data[0], 'milestone2013');
      for(var key in years){
        var year = key.replace("sum", "").replace("_", "");
        chartData.push({
          date: parseDate(year),
          stat: years[key],
          goal: milestone
        });
      }
    }
    chartData.sort(function(a,b){
      a = new Date(a.date);
      b = new Date(b.date);
      return a<b?-1:a>b?1:0;
    });
    return chartData;
  }
});