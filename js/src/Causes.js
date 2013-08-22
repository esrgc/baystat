var CausesModel = Backbone.Model.extend({
  defaults: {
    title: 'Causes of Chesapeake Bay Pollution',
    geo: 'Maryland',
    source: '',
    pollution: '',
    zoom: 8,
    lat: 38.57121,
    lng: -77.31628,
    pollutionlist: ['Nitrogen', 'Phosphorus', 'Sediment'],
    sourcelist: [
      'All Causes',
      'Farms',
      'Wastewater Treatment Plants',
      'Stormwater Runoff',
      'Septic',
      'Forests'
    ],
    invalidGeoms: ['Youghiogheny', 'Christina River', 'Coastal Bays'],
    pie_colors: ["#f0db4f", "#d80000", "#66adda", "#A278C1", "#0B6909", "#ff6600", "#a882c5"],
    causes_url: {
      'Nitrogen': "https://data.maryland.gov/resource/mp2x-4nn6.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag",
      'Phosphorus': "https://data.maryland.gov/resource/hucz-vxqe.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag",
      'Sediment': "https://data.maryland.gov/resource/bf9r-nark.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag"
    }
  },
  initialize: function(){
    this.set({pollution: this.get('pollutionlist')[0]});
    this.set({source: this.get('sourcelist')[0]});
  }
});

var PollutionMenuView = Backbone.View.extend({
  events: {
    "change #pollution": "setPollution"
  },
  template: BayStat.templates["templates/pollution-menu-template.handlebars"],
  initialize: function() {

  },
  render: function(){
     this.$el.html(this.template(this.model.toJSON()));
     this.$el.find(".pollutionRadio").first().prop("checked", true);
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
  template: BayStat.templates["templates/source-menu-template.handlebars"],
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
  el: '.dashboard',
  events: {
    "click .state": "goToState"
  },
  template: BayStat.templates["templates/causes-template.handlebars"],
  initialize: function() {
    this.listenTo(this.model, "change:source", this.getSocrataStat);
    this.listenTo(this.model, "change:geo", this.getSocrataStat);
    this.listenTo(this.model, "change:pollution", this.getSocrataStat);
    this.listenTo(this.model, "change:geo", this.getPieStats);
    this.listenTo(this.model, "change:pollution", this.getPieStats);
    var self = this;
    this.formatComma = d3.format(",");
    this.details = {
      'Nitrogen': "<b>Nitrogen</b>: Nitrogen pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Sources of nitrogen pollution include air pollution from vehicles, coal-burning power plants and industry, fertilizers from farm fields, lawns and golf courses, wastewater from industrial facilities, sewage treatment plants and septic systems, and animal manure from farms.",
      'Phosphorus': "<b>Phosphorus</b>: Phosphorus pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Phosphorus often attaches to soil and sediment particles on land, entering the Bay many years later when stream banks erode or rainwater washes it into streams, rivers, and the Bay. Sources of phosphorus pollution include fertilizers from farmlands, lawns and golf courses, eroding soil and sediment from stream banks in urban and suburban neighborhoods, animal manure from farms, and wastewater from industrial facilities and sewage treatment plants.",
      'Sediment': "<b>Sediment</b>: Maryland did not establish TMDL caps for sediments. Excess sediments - direct, clay, silt, and sand - hurt the Bay's water quality by blocking the sunlight needed by underwater plants and grasses. Without enough sunlight, these underwater grasses are not able to grow and provide habitat for young fish and blue crabs. In addition to blocking sunlight, sediment pollution can also carry nutrient and chemical contaminates into the bay, and smother oysters, underwater grasses and other bottom dwelling creatures."
    };
    this.labels = {
      'Nitrogen': "Pounds Per Year",
      'Phosphorus': "Pounds Per Year",
      'Sediment': "Tons Per Year"
    };
    this.emptyData = this.prepareData([ {
      "milestone2017" : "0",
      "sum_2009" : "0",
      "sum_2007" : "0",
      "sum_1985" : "0",
      "sum_2010" : "0",
      "sum_2011" : "0",
      "sum_2012" : "0"
    }]);
    this.render();
    this.getSocrataStat();
    this.getPieStats();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    var view = new PollutionMenuView({model: this.model});
    $("#pollution-menu").html(view.render().el);
    var view = new SourceMenuView({model: this.model});
    $("#source-menu").html(view.render().el);
    this.map = new MapView({model: this.model});
    this.makeCharts();
  },
  makeCharts: function(){
    var self = this;
    this.chart = new GeoDash.LineChart("#line .chart", {
      x: 'date',
      y: 'stat',
      width: 'auto',
      height: 'auto',
      colors: ['#d80000', '#006200'],
      interpolate: 'linear',
      axisLabels: true,
      yAxisLabel: 'Pounds Per Year'
    });
    this.pie = new GeoDash.PieChart('#pie .chart', {
      label: 'sourcesector',
      value: 'sum_2012',
      colors: self.model.get('pie_colors'),
      innerRadius: 1,
      drawX: false,
      drawY: false,
      opacity: 0.7,
      legend: '#pie .legend',
      hover: true
    });
  },
  combineSources: function(json){
    var keys = _.keys(json[0]);
    var combination = {};
    _.each(keys, function(key, idx){
      combination[key] = 0;
    });
    _.each(json, function(obj, key){
      _.each(keys, function(key, idx){
        combination[key] = combination[key] + parseFloat(obj[key]);
      });
    });
    
    var res = [];
    res.push(combination);
    return res;
  },
  getSources: function(_pollution, _geo, next){
    if(this.request) {
      this.request.abort();
    }
    var url = this.model.get('causes_url')[_pollution] + "&$select=sourcesector,sum(_2012)&$group=sourcesector";
    if(_geo !== 'Maryland') {
      url += "&$where=basinname='" + encodeURIComponent(_geo) + "'";
    }
    this.request = $.getJSON(url, function(json){
      next(json);
    });
  },
  getCauses: function(_pollution, _source, _geo, next){
    var self = this;
    if(this.request2) {
      this.request2.abort();
    }
    var geo = encodeURIComponent(_geo),
        source = encodeURIComponent(_source),
        pollution = encodeURIComponent(_pollution),
        url = this.model.get('causes_url')[pollution];

    if(_source === "Farms") {
      source = "Agriculture";
    }
    if(_source === "Forests") {
      source = "Forest' or sourcesector='Non-Tidal ATM";
    }
    if(_source === "Wastewater Treatment Plants") {
      source = "Wastewater";
    }
    if(_source === "Stormwater Runoff") {
      source = "Stormwater";
    }
    
    if(_geo === 'Maryland') {
      url += "&$select=sum(wip2017) as milestone2017,sum(_1985),sum(_2007),sum(_2009),sum(_2010),sum(_2011),sum(_2012)";
      if(_source !== 'All Causes') {
        url += "&$where=sourcesector='" + source + "'";
      }
    } else {
      if(_source === 'All Causes') {
        url += "&$select=sum(wip2017) as milestone2017,sum(_1985),sum(_2007),sum(_2009),sum(_2010),sum(_2011),sum(_2012)";
        url += "&$where=basinname='" + geo + "'";
      } else {
        url += "&$select=wip2017 as milestone2017,_1985,_2007,_2009,_2010,_2011,_2012";
        url += "&$where=basinname='" + geo + "'";
        url += " and (sourcesector='" + source + "')";
      }
    }
    
    this.request2 = $.getJSON(url, function(json){
      if(json.length > 1){
        json = self.combineSources(json);
      }
      next(json);
    });
  },
  getPieStats: function() {
    var self = this;
    if(self.request1){
      self.request1.abort();
    }
    var empty_data = [{"sourcesector":"Farms","sum_2012":"1"},{"sourcesector":"Wastewater Treatment Plants","sum_2012":"0"},{"sourcesector":"Stormwater Runoff","sum_2012":"0"},{"sourcesector":"Septic","sum_2012":"0"},{"sourcesector":"Forests","sum_2012":"0"}];
    if(_.contains(self.model.get('invalidGeoms'), self.model.get('geo'))) {
      self.pie.setColors(['#ccc']);
      self.pie.update(empty_data);
    } else {
      self.pie.setColors(self.model.get('pie_colors'));
      self.getSources(self.model.get('pollution'), self.model.get('geo'), function(res){
        var data = [];
        var atm = _.where(res, {sourcesector: "Non-Tidal Atm"})[0];
        _.each(res, function(source, idx){
          if(source.sourcesector === 'Forest') {
            source.sum_2012 = source.sum_2012 + parseInt(atm.sum_2012);
          }
          if(source.sourcesector === 'Agriculture') {
            source.sourcesector = 'Farms';
          }
          if(source.sourcesector === 'Forest') {
            source.sourcesector = 'Forests';
          }
          if(source.sourcesector === 'Stormwater') {
            source.sourcesector = 'Stormwater Runoff';
          }
          if(source.sourcesector === 'Wastewater') {
            source.sourcesector = 'Wastewater Treatment Plants';
          }
          if(source.sourcesector !== "Non-Tidal Atm"){
            data.push(source);
          }
        });
        var sorted_data = [];
        var obj = _.where(res, {sourcesector: "Farms"})[0];
        sorted_data.push(obj);
        obj = _.where(res, {sourcesector: "Wastewater Treatment Plants"})[0];
        sorted_data.push(obj);
        obj = _.where(res, {sourcesector: "Stormwater Runoff"})[0];
        sorted_data.push(obj);
        obj = _.where(res, {sourcesector: "Septic"})[0];
        sorted_data.push(obj);
        obj = _.where(res, {sourcesector: "Forests"})[0];
        sorted_data.push(obj);
        self.pie.update(sorted_data);
      });
    }
  },
  getSocrataStat: function(){
    var self = this;
    if(self.request2){
      self.request2.abort();
    }
    self.chart.update(self.emptyData);
    self.updateLabels();
    this.chart.setYAxisLabel(self.labels[self.model.get('pollution')]);
    if(_.contains(self.model.get('invalidGeoms'), self.model.get('geo'))) {
      
    } else {
      this.getCauses(self.model.get('pollution'), self.model.get('source'), self.model.get('geo'), function(res) {
        var data = self.prepareData(res);
        self.chart.update(data);
        self.updateLabels();
      });
    }
  },
  updateLabels: function() {
    var self = this;
    var charttitle = '<h5>' + self.model.get('pollution') + ' pollution from ' + self.model.get('source') + ' in ' + self.model.get('geo') + '</h5>';
    if(_.contains(self.model.get('invalidGeoms'), self.model.get('geo'))) {
      charttitle = '<h5>This basin is in the ' + self.model.get('geo') + ' watershed. <br><span class="text-danger">(Not in Bay watershed)</span></h5>';
    }
    $('#line .title').html(charttitle);
    var pollution = self.model.get('pollution');
    var capitalPollution = pollution.charAt(0).toUpperCase() + pollution.slice(1);
    var dashboardtitle = '<h5>' + self.model.get('geo') + '</h5><p>' + capitalPollution + '</p>';
    $('#title').html(dashboardtitle);
    $('#details').html(this.details[pollution]);
    $('.x.axis text').each(function(idx){
      var year  = d3.select(this).text();
      if(year === '2006') {
        year = '1985';
        d3.select(this).text(year);
      }
    });
  },
  prepareData: function(data) {
    var chartData = [];
    var milestone = data[0]["milestone2017"];
    var parseDate = d3.time.format("%Y").parse;
    for(var i = 0; i < data.length; i++){
      var years = _.omit(data[0], 'milestone2017');
      for(var key in years){
        var year = key.replace("sum", "").replace("_", "");
        if(year === '1985') year = '2006';
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
  },
  goToState: function(e){
    this.map.geojsonlayer.setStyle(this.map.style);
    this.model.set({geo: 'Maryland'});
    return false;
  }
});