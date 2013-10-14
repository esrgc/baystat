var CausesModel = Backbone.Model.extend({
  defaults: {
    title: 'Causes of Chesapeake Bay Pollution',
    geo: 'Maryland',
    source: '',
    pollution: '',
    zoom: 8,
    lat: 38.57121,
    lng: -77.31628,
    activelayer: 'Tributary Basins',
    layerlist: [{
      'name': 'Tributary Basins',
      'column': 'trib_basin_name',
    },{
      'name':'Major Basins',
      'column': 'major_basin_name'
    }, {
      'name': 'Counties',
      'column': 'county'
    }],
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
      'Nitrogen': "https://data.maryland.gov/resource/rsrj-4w3t.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag",
      'Phosphorus': "https://data.maryland.gov/resource/eumn-ip4q.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag",
      'Sediment': "https://data.maryland.gov/resource/x5pe-335m.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag"
    },
  },
  getSources: function(_pollution, _geo){
    if(this.get('request')) {
      this.get('request').abort();
    }
    var url = this.get('causes_url')[_pollution] + "&$select=source_sector,sum(_2012) as sum_2012&$group=source_sector";
    var geo_column = _.where(this.get('layerlist'), {name: this.get('activelayer')})[0].column;
    if(_geo !== 'Maryland') {
      url += "&$where=" + geo_column + "='" + encodeURIComponent(_geo) + "'";
    }
    var request = $.ajax({
      dataType: "jsonp",
      jsonp: false,
      url: url + '&$jsonp=BayStat.Causes.receivePieData'
    });
    this.set("request", request);
  },
  getCauses: function(_pollution, _source, _geo){
    var self = this;
    if(this.get('request2')) {
      this.get('request2').abort();
    }
    var geo = encodeURIComponent(_geo),
        source = encodeURIComponent(_source),
        pollution = encodeURIComponent(_pollution),
        url = this.get('causes_url')[pollution];

    if(_source === "Farms") {
      source = "Agriculture";
    }
    if(_source === "Forests") {
      source = "Forest' or source_sector='Non-Tidal ATM";
    }
    if(_source === "Wastewater Treatment Plants") {
      source = "Wastewater";
    }
    if(_source === "Stormwater Runoff") {
      source = "Stormwater";
    }
    var geo_column = _.where(self.get('layerlist'), {name: self.get('activelayer')})[0].column;
    url += "&$select=sum(wip_outcome_2017) as milestone2017,sum(_1985) as sum_1985,sum(_2007) as sum_2007,sum(_2009) as sum_2009,sum(_2010) as sum_2010,sum(_2011) as sum_2011,sum(_2012) as sum_2012";
    if(_geo === 'Maryland') {
      if(_source !== 'All Causes') {
        url += "&$where=source_sector='" + source + "'";
      }
    } else {
      if(_source === 'All Causes') {
        url += "&$where=" + geo_column + "='" + geo + "'";
      } else {
        url += "&$where=" + geo_column + "='" + geo + "'";
        url += " and (source_sector='" + source + "')";
      }
    }
    var request2 = $.ajax({
      dataType: "jsonp",
      jsonp: false,
      url: url + '&$jsonp=BayStat.Causes.receiveLineData'
    });
    this.set("request2", request2);
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

var LayerMenuView = Backbone.View.extend({
  events: {
    "change #layers": "setLayer"
  },
  template: BayStat.templates["templates/layer-menu-template.handlebars"],
  initialize: function() {

  },
  render: function(){
     this.$el.html(this.template(this.model.toJSON()));
     return this;
  },
  setLayer: function(e) {
    var $target = $(e.target);
    var layer = $target.val();
    this.model.set({activelayer: layer});
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
    this.listenTo(this.model, "change:source", this.updateLineChart);
    this.listenTo(this.model, "change:geo", this.updateLineChart);
    this.listenTo(this.model, "change:pollution", this.updateLineChart);
    this.listenTo(this.model, "change:geo", this.updatePieChart);
    this.listenTo(this.model, "change:pollution", this.updatePieChart);
    var self = this;
    this.formatComma = d3.format(",");
    this.details = {
      'Nitrogen': "<b>Nitrogen</b>: Nitrogen pollution fuel the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Sources of nitrogen pollution include air pollution from vehicles, coal-burning power plants and industry, fertilizers from farm fields, lawns and golf courses, wastewater from industrial facilities, sewage treatment plants and septic systems, and animal manure from farms. <p><b>Data source:</b>  EPA Phase 5.3.2 Watershed Model</p>",
      'Phosphorus': "<b>Phosphorus</b>: Phosphorus pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Phosphorus often attaches to soil and sediment particles on land, entering the Bay many years later when stream banks erode or rainwater washes it into streams, rivers, and the Bay. Sources of phosphorus pollution include fertilizers from farmlands, lawns and golf courses, eroding soil and sediment from stream banks in urban and suburban neighborhoods, animal manure from farms, and wastewater from industrial facilities and sewage treatment plants.<p><b>Data source:</b>  EPA Phase 5.3.2 Watershed Model</p>",
      'Sediment': "<b>Sediment</b>: Maryland did not establish TMDL caps for sediments. Excess sediments - direct, clay, silt, and sand - hurt the Bay's water quality by blocking the sunlight needed by underwater plants and grasses. Without enough sunlight, these underwater grasses are not able to grow and provide habitat for young fish and blue crabs. In addition to blocking sunlight, sediment pollution can also carry nutrient and chemical contaminates into the bay, and smother oysters, underwater grasses and other bottom dwelling creatures.<p><b>Data source:</b>  EPA Phase 5.3.2 Watershed Model</p>"
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
    this.updateLineChart();
    this.updatePieChart();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    var view = new PollutionMenuView({model: this.model});
    $("#pollution-menu").html(view.render().el);
    var view = new LayerMenuView({model: this.model});
    $("#layer-menu").html(view.render().el);
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
      interpolate: 'monotone',
      axisLabels: true,
      yAxisLabel: 'Pounds Per Year',
      dashed: [{
        line: 0,
        span: [{
          start: 0,
          end: 1
        }]
      },{
        line: 1,
        span: [{
          start: 0,
          end: 1
        }]
      }]
    });
    this.pie = new GeoDash.PieChart('#pie .chart', {
      label: 'source_sector',
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
  updatePieChart: function() {
    var self = this;
    if(self.request1){
      self.request1.abort();
    }
    var empty_data = [{"source_sector":"Farms","sum_2012":"1"},{"source_sector":"Wastewater Treatment Plants","sum_2012":"0"},{"source_sector":"Stormwater Runoff","sum_2012":"0"},{"source_sector":"Septic","sum_2012":"0"},{"source_sector":"Forests","sum_2012":"0"}];
    if(_.contains(self.model.get('invalidGeoms'), self.model.get('geo'))) {
      self.pie.setColors(['#ccc']);
      self.pie.update(empty_data);
    } else {
      self.pie.setColors(self.model.get('pie_colors'));
      self.model.getSources(self.model.get('pollution'), self.model.get('geo'));
    }
  },
  receivePieData: function(res){
    var self = this;
    var data = [];
    var atm = _.where(res, {source_sector: "Non-Tidal Atm"})[0];
    _.each(res, function(source, idx){
      if(source.source_sector === 'Forest') {
        source.sum_2012 = source.sum_2012 + parseInt(atm.sum_2012);
      }
      if(source.source_sector === 'Agriculture') {
        source.source_sector = 'Farms';
      }
      if(source.source_sector === 'Forest') {
        source.source_sector = 'Forests';
      }
      if(source.source_sector === 'Stormwater') {
        source.source_sector = 'Stormwater Runoff';
      }
      if(source.source_sector === 'Wastewater') {
        source.source_sector = 'Wastewater Treatment Plants';
      }
      if(source.source_sector !== "Non-Tidal Atm"){
        data.push(source);
      }
    });
    var sorted_data = [];
    var obj = _.where(res, {source_sector: "Farms"})[0];
    sorted_data.push(obj);
    obj = _.where(res, {source_sector: "Wastewater Treatment Plants"})[0];
    sorted_data.push(obj);
    obj = _.where(res, {source_sector: "Stormwater Runoff"})[0];
    sorted_data.push(obj);
    obj = _.where(res, {source_sector: "Septic"})[0];
    sorted_data.push(obj);
    obj = _.where(res, {source_sector: "Forests"})[0];
    sorted_data.push(obj);
    self.pie.update(sorted_data);
  },
  updateLineChart: function(){
    var self = this;
    if(self.request2){
      self.request2.abort();
    }
    self.chart.update(self.emptyData);
    self.updateLabels();
    this.chart.setYAxisLabel(self.labels[self.model.get('pollution')]);
    if(_.contains(self.model.get('invalidGeoms'), self.model.get('geo'))) {
      
    } else {
      this.model.getCauses(self.model.get('pollution'), self.model.get('source'), self.model.get('geo'));
    }
  },
  receiveLineData: function(res){
    var data = this.prepareData(res);
    this.chart.update(data);
    this.updateLabels();
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
        var year = key.replace("sum_", "");
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