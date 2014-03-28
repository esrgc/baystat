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
    goals: ['milestone2017'],
    linecolors: ['#d80000', '#006200', '#eb7600'],
    layerlist: [{
      'name': 'Tributary Basins',
      'column': 'trib_basin',
    },{
      'name':'Major Basins',
      'column': 'major_basin'
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
    goal_key: {
      'Nitrogen': "tn_target",
      'Phosphorus': "tp_target",
      'Sediment': "ts_target"
    }
  },
  getSources: function(_pollution, _geo){
    if(this.get('request')) {
      this.get('request').abort();
    }
    var url = this.get('causes_url')[_pollution] + "&$select=source_sector,sum(_2013) as sum_2013&$group=source_sector";
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
    if(_geo === 'Patapsco Back River') {
      _geo = 'Patapsco/Back'
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
    url += "&$select=sum(" + this.get('goal_key')[pollution] + "_2017) as milestone2017,sum(" + this.get('goal_key')[pollution] + "_2025) as milestone2025, sum(_1985) as sum_1985,sum(_2007) as sum_2007,sum(_2009) as sum_2009,sum(_2010) as sum_2010,sum(_2011) as sum_2011,sum(_2012) as sum_2012,sum(_2013) as sum_2013";
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
     this.$el.find('input[value="' + this.model.get("pollution") +'"]').prop("checked", true);
     //this.$el.find(".pollutionRadio").first().prop("checked", true);
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
    "click .state": "goToState",
    "change #goal-menu": "changeGoal"
  },
  template: BayStat.templates["templates/causes-template.handlebars"],
  initialize: function() {
    this.listenTo(this.model, "change:source", this.updateLineChart);
    this.listenTo(this.model, "change:geo", this.updateLineChart);
    this.listenTo(this.model, "change:pollution", this.updateLineChart);
    this.listenTo(this.model, "change:geo", this.updatePieChart);
    this.listenTo(this.model, "change:pollution", this.updatePieChart);
    this.listenTo(this.model, "change:goals", this.updateLineChart);
    this.formatComma = d3.format(",");
    this.details = {
      'Nitrogen': "<b>Nitrogen</b>:  The 1985 scenario is from EPA CBP Phase 5.3.2 using 1985 atmospheric reduction strategies.  Atmospheric reduction strategies projected to be in place by 2025 would have reduced Maryland's 1985 statewide nitrogen load by 4.8 million lbs/yr.  This reduction is due to actions both within Maryland and in the larger Chesapeake Bay airshed.  Changes in pollution over time are the result of a combination of reduction in atmospheric deposition, reduction due to management practices, and change due to new development. </p><p>Note that the 2017 goal represents 60% progress toward achieving the 2025 goal <p><b>Data source:</b>  EPA Phase 5.3.2 Watershed Model</p>",
      'Phosphorus': "<b>Phosphorus</b>: Phosphorus pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Phosphorus often attaches to soil and sediment particles on land, entering the Bay many years later when stream banks erode or rainwater washes it into streams, rivers, and the Bay. Sources of phosphorus pollution include fertilizers from farmlands, lawns and golf courses, eroding soil and sediment from stream banks in urban and suburban neighborhoods, animal manure from farms, and wastewater from industrial facilities and sewage treatment plants.<p><b>Data source:</b>  EPA Phase 5.3.2 Watershed Model</p>",
      'Sediment': "<b>Sediment</b>: Maryland did not establish TMDL caps for sediments. Excess sediments - direct, clay, silt, and sand - hurt the Bay's water quality by blocking the sunlight needed by underwater plants and grasses. Without enough sunlight, these underwater grasses are not able to grow and provide habitat for young fish and blue crabs. In addition to blocking sunlight, sediment pollution can also carry nutrient and chemical contaminates into the bay, and smother oysters, underwater grasses and other bottom dwelling creatures.<p><b>Data source:</b>  EPA Phase 5.3.2 Watershed Model</p>"
    };
    this.labels = {
      'Nitrogen': "Pounds",
      'Phosphorus': "Pounds",
      'Sediment': "Tons"
    };
    this.emptyData = this.prepareData([{
      "milestone2017" : "0",
      "milestone2025" : "0",
      "sum_2009" : "0",
      "sum_2007" : "0",
      "sum_1985" : "0",
      "sum_2010" : "0",
      "sum_2011" : "0",
      "sum_2012" : "0",
      "sum_2013" : "0"
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
    this.setDashedLines();
  },
  makeCharts: function(){
    var self = this;
    this.chart = new GeoDash.LineChart("#line .chart", {
      x: 'date',
      y: ['stat'],
      colors: this.model.get('linecolors'),
      opacity: 0.6,
      interpolate: 'monotone',
      yLabel: 'Pounds Per Year',
      xTickFormat: d3.time.format('%Y'),
      yTickFormat: d3.format('.3s'),
      yAxisWidth: 30,
      hoverTemplate: '{{y}}',
      valueFormat: d3.format(",.0f")
    });
    this.pie = new GeoDash.PieChart('#pie .chart', {
      label: 'source_sector',
      value: 'sum_2013',
      title: false,
      colors: self.model.get('pie_colors'),
      innerRadius: 0,
      opacity: 0.7,
      legend: true,
      hover: true,
      legendWidth: 120,
      legendPosition: 'top'
    });
  },
  updatePieChart: function() {
    var self = this;
    if(self.request1){
      self.request1.abort();
    }
    var empty_data = [{"source_sector":"Farms","sum_2013":"1"},{"source_sector":"Wastewater Treatment Plants","sum_2013":"0"},{"source_sector":"Stormwater Runoff","sum_2013":"0"},{"source_sector":"Septic","sum_2013":"0"},{"source_sector":"Forests","sum_2013":"0"}];
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
        source.sum_2013 = source.sum_2013 + parseInt(atm.sum_2013);
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
    if(this.request2){
      this.request2.abort();
    }
    this.chart.options.hoverTemplate = '{{y}} ' + this.labels[this.model.get('pollution')]
    this.chart.setYAxisLabel(this.labels[this.model.get('pollution')]);
    if(_.contains(this.model.get('invalidGeoms'), this.model.get('geo'))) {
      
    } else {
      this.model.getCauses(this.model.get('pollution'), this.model.get('source'), this.model.get('geo'));
    }
    this.chart.update(this.emptyData);
    this.updateLabels();
    this.setDashedLines();
  },
  receiveLineData: function(res){
    var self = this
    // if(this.model.get('geo') == 'Maryland') {
    //   res = this.addCurrentYear(res)
    // }
    var data = this.prepareData(res);
    this.chart.update(data);
    setTimeout(function(){
      self.updateLabels();  
    }, 500)
    
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
    $('.x.axis .tick').each(function(idx){
      var year  = d3.select(this).select('.gd-label').html();
      if(year === '2006') {
        d3.select(this).select('.gd-label').html('1985');
      }
    });
  },
  prepareData: function(data) {
    var self = this
    var chartData = [];
    var milestone = data[0]["milestone2017"];
    var milestone2 = data[0]["milestone2025"];
    var parseDate = d3.time.format("%Y").parse;
    for(var i = 0; i < data.length; i++){
      var years = _.omit(data[0], ['milestone2017', 'milestone2025']);
      for(var key in years){
        var year = key.replace("sum_", "");
        if(year === '1985') year = '2006';
        var p = {
          date: parseDate(year),
          stat: years[key]
        };
        _.each(this.model.get('goals'), function(goal, idx){
          p['goal' + idx] = data[0][goal];
          if(self.chart) self.chart.options.y.push('goal' + idx)
        });
        chartData.push(p);
      }
    }
    chartData.sort(function(a,b){
      a = new Date(a.date);
      b = new Date(b.date);
      return a<b?-1:a>b?1:0;
    });
    return chartData;
  },
  addCurrentYear: function(data) {
    var self = this
    var currentyear = {
      "Nitrogen": {
        "All Causes": "48410484",
        "Farms": "18002999",
        "Forests": "5990714",
        "Septic": "2950094",
        "Stormwater Runoff": "9529595",
        "Wastewater Treatment Plants": "11937083"
      },
      "Phosphorus": {
        "All Causes": "3021448",
        "Farms": "1582315",
        "Forests": "193267",
        "Septic": "0",
        "Stormwater Runoff": "638059",
        "Wastewater Treatment Plants": "607807"
      },
      "Sediment": {
        "All Causes": "1288177644",
        "Farms": "659188677",
        "Forests": "127443259",
        "Septic": "0",
        "Stormwater Runoff": "490646155",
        "Wastewater Treatment Plants": "10899553"
      }
    }
    var stat = currentyear[self.model.get('pollution')][self.model.get('source')]
    data[0]['sum_2013'] = stat
    return data
  },
  setDashedLines: function(){
    var dashed = [];
    var count = 0;
    _.each(this.model.get('goals'), function(goal, idx){
      dashed.push({
        line: idx,
        span: {
          start: 0,
          howMany: 1
        }
      });
      count = idx;
    });
    dashed.push({
        line: count+1,
        span: {
          start: 0,
          howMany: 1
        }
      });
    this.chart.options.dashed = dashed;
  },
  goToState: function(e){
    this.map.geojsonlayer.setStyle(this.map.style);
    this.model.set({geo: 'Maryland'});
    return false;
  },
  changeGoal: function(e){
    var $target = $(e.target);
    var goal = $target.val();
    var goals = goal.split(',');
    if(goals[0] === 'milestone2025') {
      this.chart.options.colors = [this.model.get('linecolors')[0], this.model.get('linecolors')[2]];
      $('.sample.secondary').css('background', this.model.get('linecolors')[2]);
    } else {
      this.chart.options.colors = this.model.get('linecolors');
      $('.sample.secondary').css('background', this.model.get('linecolors')[1]);
    }
    if(goals.length > 1){
      var bg = '-webkit-gradient(linear, left top, right top, color-stop(50%,'+this.model.get('linecolors')[1]+'), color-stop(50%,#333), color-stop(0%,'+this.model.get('linecolors')[2]+'))';
      $('.sample.secondary').css('background', '#fff');
    }
    this.model.set('goals', goals);
  }
});