/*! 
baystat-dashboards v0.4.5 2013-10-07 
Author: @frnkrw 
*/
var CausesModel = Backbone.Model.extend({
    defaults: {
        title: "Causes of Chesapeake Bay Pollution",
        geo: "Maryland",
        source: "",
        pollution: "",
        zoom: 8,
        lat: 38.57121,
        lng: -77.31628,
        activelayer: "Basins",
        layerlist: [ "Basins", "Major Basins", "Counties" ],
        pollutionlist: [ "Nitrogen", "Phosphorus", "Sediment" ],
        sourcelist: [ "All Causes", "Farms", "Wastewater Treatment Plants", "Stormwater Runoff", "Septic", "Forests" ],
        invalidGeoms: [ "Youghiogheny", "Christina River", "Coastal Bays" ],
        pie_colors: [ "#f0db4f", "#d80000", "#66adda", "#A278C1", "#0B6909", "#ff6600", "#a882c5" ],
        causes_url: {
            Nitrogen: "https://data.maryland.gov/resource/mp2x-4nn6.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag",
            Phosphorus: "https://data.maryland.gov/resource/hucz-vxqe.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag",
            Sediment: "https://data.maryland.gov/resource/bf9r-nark.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag"
        }
    },
    getSources: function(_pollution, _geo) {
        if (this.get("request")) {
            this.get("request").abort();
        }
        var url = this.get("causes_url")[_pollution] + "&$select=sourcesector,sum(_2012)&$group=sourcesector";
        if (_geo !== "Maryland") {
            url += "&$where=basinname='" + encodeURIComponent(_geo) + "'";
        }
        var request = $.ajax({
            dataType: "jsonp",
            jsonp: false,
            url: url + "&$jsonp=BayStat.Causes.receivePieData"
        });
        this.set("request", request);
    },
    getCauses: function(_pollution, _source, _geo) {
        var self = this;
        if (this.get("request2")) {
            this.get("request2").abort();
        }
        var geo = encodeURIComponent(_geo), source = encodeURIComponent(_source), pollution = encodeURIComponent(_pollution), url = this.get("causes_url")[pollution];
        if (_source === "Farms") {
            source = "Agriculture";
        }
        if (_source === "Forests") {
            source = "Forest' or sourcesector='Non-Tidal ATM";
        }
        if (_source === "Wastewater Treatment Plants") {
            source = "Wastewater";
        }
        if (_source === "Stormwater Runoff") {
            source = "Stormwater";
        }
        if (_geo === "Maryland") {
            url += "&$select=sum(wip2017) as milestone2017,sum(_1985),sum(_2007),sum(_2009),sum(_2010),sum(_2011),sum(_2012)";
            if (_source !== "All Causes") {
                url += "&$where=sourcesector='" + source + "'";
            }
        } else {
            if (_source === "All Causes") {
                url += "&$select=sum(wip2017) as milestone2017,sum(_1985),sum(_2007),sum(_2009),sum(_2010),sum(_2011),sum(_2012)";
                url += "&$where=basinname='" + geo + "'";
            } else {
                url += "&$select=wip2017 as milestone2017,_1985,_2007,_2009,_2010,_2011,_2012";
                url += "&$where=basinname='" + geo + "'";
                url += " and (sourcesector='" + source + "')";
            }
        }
        var request2 = $.ajax({
            dataType: "jsonp",
            jsonp: false,
            url: url + "&$jsonp=BayStat.Causes.receiveLineData"
        });
        this.set("request2", request2);
    },
    combineSources: function(json) {
        var keys = _.keys(json[0]);
        var combination = {};
        _.each(keys, function(key, idx) {
            combination[key] = 0;
        });
        _.each(json, function(obj, key) {
            _.each(keys, function(key, idx) {
                combination[key] = combination[key] + parseFloat(obj[key]);
            });
        });
        var res = [];
        res.push(combination);
        return res;
    },
    initialize: function() {
        this.set({
            pollution: this.get("pollutionlist")[0]
        });
        this.set({
            source: this.get("sourcelist")[0]
        });
    }
});

var PollutionMenuView = Backbone.View.extend({
    events: {
        "change #pollution": "setPollution"
    },
    template: BayStat.templates["templates/pollution-menu-template.handlebars"],
    initialize: function() {},
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.find(".pollutionRadio").first().prop("checked", true);
        return this;
    },
    setPollution: function(e) {
        var $target = $(e.target);
        var pollution = $("#pollution input:checked").val();
        this.model.set({
            pollution: pollution
        });
    }
});

var LayerMenuView = Backbone.View.extend({
    events: {
        "change #layers": "setLayer"
    },
    template: BayStat.templates["templates/layer-menu-template.handlebars"],
    initialize: function() {},
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    setLayer: function(e) {
        var $target = $(e.target);
        var layer = $target.val();
        this.model.set({
            activelayer: layer
        });
    }
});

var SourceMenuView = Backbone.View.extend({
    events: {
        "change #source": "setSource"
    },
    template: BayStat.templates["templates/source-menu-template.handlebars"],
    initialize: function() {},
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    setSource: function(e) {
        var $target = $(e.target);
        var source = $("#source").val();
        this.model.set({
            source: source
        });
    }
});

var CausesView = Backbone.View.extend({
    el: ".dashboard",
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
            Nitrogen: "<b>Nitrogen</b>: Nitrogen pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Sources of nitrogen pollution include air pollution from vehicles, coal-burning power plants and industry, fertilizers from farm fields, lawns and golf courses, wastewater from industrial facilities, sewage treatment plants and septic systems, and animal manure from farms.",
            Phosphorus: "<b>Phosphorus</b>: Phosphorus pollution fuels the growth of algae, creating dense, harmful algae blooms that rob the Chesapeake Bay's aquatic life of needed sunlight and oxygen. Phosphorus often attaches to soil and sediment particles on land, entering the Bay many years later when stream banks erode or rainwater washes it into streams, rivers, and the Bay. Sources of phosphorus pollution include fertilizers from farmlands, lawns and golf courses, eroding soil and sediment from stream banks in urban and suburban neighborhoods, animal manure from farms, and wastewater from industrial facilities and sewage treatment plants.",
            Sediment: "<b>Sediment</b>: Maryland did not establish TMDL caps for sediments. Excess sediments - direct, clay, silt, and sand - hurt the Bay's water quality by blocking the sunlight needed by underwater plants and grasses. Without enough sunlight, these underwater grasses are not able to grow and provide habitat for young fish and blue crabs. In addition to blocking sunlight, sediment pollution can also carry nutrient and chemical contaminates into the bay, and smother oysters, underwater grasses and other bottom dwelling creatures."
        };
        this.labels = {
            Nitrogen: "Pounds Per Year",
            Phosphorus: "Pounds Per Year",
            Sediment: "Tons Per Year"
        };
        this.emptyData = this.prepareData([ {
            milestone2017: "0",
            sum_2009: "0",
            sum_2007: "0",
            sum_1985: "0",
            sum_2010: "0",
            sum_2011: "0",
            sum_2012: "0"
        } ]);
        this.render();
        this.updateLineChart();
        this.updatePieChart();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        var view = new PollutionMenuView({
            model: this.model
        });
        $("#pollution-menu").html(view.render().el);
        var view = new LayerMenuView({
            model: this.model
        });
        $("#layer-menu").html(view.render().el);
        var view = new SourceMenuView({
            model: this.model
        });
        $("#source-menu").html(view.render().el);
        this.map = new MapView({
            model: this.model
        });
        this.makeCharts();
    },
    makeCharts: function() {
        var self = this;
        this.chart = new GeoDash.LineChart("#line .chart", {
            x: "date",
            y: "stat",
            width: "auto",
            height: "auto",
            colors: [ "#d80000", "#006200" ],
            interpolate: "monotone",
            axisLabels: true,
            yAxisLabel: "Pounds Per Year",
            dashed: [ {
                line: 0,
                span: [ {
                    start: 0,
                    end: 1
                } ]
            }, {
                line: 1,
                span: [ {
                    start: 0,
                    end: 1
                } ]
            } ]
        });
        this.pie = new GeoDash.PieChart("#pie .chart", {
            label: "sourcesector",
            value: "sum_2012",
            colors: self.model.get("pie_colors"),
            innerRadius: 1,
            drawX: false,
            drawY: false,
            opacity: .7,
            legend: "#pie .legend",
            hover: true
        });
    },
    updatePieChart: function() {
        var self = this;
        if (self.request1) {
            self.request1.abort();
        }
        var empty_data = [ {
            sourcesector: "Farms",
            sum_2012: "1"
        }, {
            sourcesector: "Wastewater Treatment Plants",
            sum_2012: "0"
        }, {
            sourcesector: "Stormwater Runoff",
            sum_2012: "0"
        }, {
            sourcesector: "Septic",
            sum_2012: "0"
        }, {
            sourcesector: "Forests",
            sum_2012: "0"
        } ];
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {
            self.pie.setColors([ "#ccc" ]);
            self.pie.update(empty_data);
        } else {
            self.pie.setColors(self.model.get("pie_colors"));
            self.model.getSources(self.model.get("pollution"), self.model.get("geo"));
        }
    },
    receivePieData: function(res) {
        var self = this;
        var data = [];
        var atm = _.where(res, {
            sourcesector: "Non-Tidal Atm"
        })[0];
        _.each(res, function(source, idx) {
            if (source.sourcesector === "Forest") {
                source.sum_2012 = source.sum_2012 + parseInt(atm.sum_2012);
            }
            if (source.sourcesector === "Agriculture") {
                source.sourcesector = "Farms";
            }
            if (source.sourcesector === "Forest") {
                source.sourcesector = "Forests";
            }
            if (source.sourcesector === "Stormwater") {
                source.sourcesector = "Stormwater Runoff";
            }
            if (source.sourcesector === "Wastewater") {
                source.sourcesector = "Wastewater Treatment Plants";
            }
            if (source.sourcesector !== "Non-Tidal Atm") {
                data.push(source);
            }
        });
        var sorted_data = [];
        var obj = _.where(res, {
            sourcesector: "Farms"
        })[0];
        sorted_data.push(obj);
        obj = _.where(res, {
            sourcesector: "Wastewater Treatment Plants"
        })[0];
        sorted_data.push(obj);
        obj = _.where(res, {
            sourcesector: "Stormwater Runoff"
        })[0];
        sorted_data.push(obj);
        obj = _.where(res, {
            sourcesector: "Septic"
        })[0];
        sorted_data.push(obj);
        obj = _.where(res, {
            sourcesector: "Forests"
        })[0];
        sorted_data.push(obj);
        self.pie.update(sorted_data);
    },
    updateLineChart: function() {
        var self = this;
        if (self.request2) {
            self.request2.abort();
        }
        self.chart.update(self.emptyData);
        self.updateLabels();
        this.chart.setYAxisLabel(self.labels[self.model.get("pollution")]);
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {} else {
            this.model.getCauses(self.model.get("pollution"), self.model.get("source"), self.model.get("geo"));
        }
    },
    receiveLineData: function(res) {
        var data = this.prepareData(res);
        console.log(data);
        this.chart.update(data);
        this.updateLabels();
    },
    updateLabels: function() {
        var self = this;
        var charttitle = "<h5>" + self.model.get("pollution") + " pollution from " + self.model.get("source") + " in " + self.model.get("geo") + "</h5>";
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {
            charttitle = "<h5>This basin is in the " + self.model.get("geo") + ' watershed. <br><span class="text-danger">(Not in Bay watershed)</span></h5>';
        }
        $("#line .title").html(charttitle);
        var pollution = self.model.get("pollution");
        var capitalPollution = pollution.charAt(0).toUpperCase() + pollution.slice(1);
        var dashboardtitle = "<h5>" + self.model.get("geo") + "</h5><p>" + capitalPollution + "</p>";
        $("#title").html(dashboardtitle);
        $("#details").html(this.details[pollution]);
        $(".x.axis text").each(function(idx) {
            var year = d3.select(this).text();
            if (year === "2006") {
                year = "1985";
                d3.select(this).text(year);
            }
        });
    },
    prepareData: function(data) {
        var chartData = [];
        var milestone = data[0]["milestone2017"];
        var parseDate = d3.time.format("%Y").parse;
        for (var i = 0; i < data.length; i++) {
            var years = _.omit(data[0], "milestone2017");
            for (var key in years) {
                var year = key.replace("sum", "").replace("_", "");
                if (year === "1985") year = "2006";
                chartData.push({
                    date: parseDate(year),
                    stat: years[key],
                    goal: milestone
                });
            }
        }
        chartData.sort(function(a, b) {
            a = new Date(a.date);
            b = new Date(b.date);
            return a < b ? -1 : a > b ? 1 : 0;
        });
        return chartData;
    },
    goToState: function(e) {
        this.map.geojsonlayer.setStyle(this.map.style);
        this.model.set({
            geo: "Maryland"
        });
        return false;
    }
});

var MapView = Backbone.View.extend({
    events: {},
    initialize: function() {
        this.listenTo(this.model, "change:activelayer", this.switchLayer);
        this.defaults = {
            zoom: 7,
            lat: 38,
            lng: -75
        };
        this.style = {
            fillColor: "#fff",
            fillOpacity: .5,
            color: "#000",
            strokeOpacity: 1,
            weight: 1
        };
        this.selectedStyle = {
            color: "#000",
            fillColor: "#19547e",
            fillOpacity: .9,
            weight: 1
        };
        this.selectedStyleInvalid = {
            color: "#000",
            fillColor: "#878787",
            fillOpacity: .9,
            weight: 1
        };
        this.hoverStyle = {
            color: "#000",
            fillColor: "#19547e",
            fillOpacity: .7,
            weight: 1
        };
        this.hoverStyleInvalid = {
            color: "#000",
            fillColor: "#ccc",
            fillOpacity: .7,
            weight: 1
        };
        this.render();
    },
    render: function() {
        var self = this;
        this.map = new L.Map("map", {
            attributionControl: false,
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            tap: true
        }).setView(new L.LatLng(this.model.get("lat"), this.model.get("lng")), this.model.get("zoom"));
        $(".leaflet-top.leaflet-right").html('<div class="geom-hover"></div>');
        L.tileLayer("http://{s}.tiles.mapbox.com/v3/esrgc.map-4zj131o4/{z}/{x}/{y}.png").addTo(this.map);
        $.getJSON("data/watershed4.geojson", function(geojson) {
            self.basinlayer = L.geoJson(geojson, {
                style: self.style,
                onEachFeature: function(f, l) {
                    self.onEachFeature(f, l);
                },
                filter: function(feature, layer) {
                    return true;
                }
            }).addTo(self.map);
            self.geojsonlayer = self.basinlayer;
        });
        $.getJSON("data/majorbasins.geojson", function(geojson) {
            self.majorbasinslayer = L.geoJson(geojson, {
                style: self.style,
                onEachFeature: function(f, l) {
                    self.onEachFeature(f, l);
                },
                filter: function(feature, layer) {
                    return true;
                }
            });
        });
        $.getJSON("data/mdcnty.geojson", function(geojson) {
            self.countylayer = L.geoJson(geojson, {
                style: self.style,
                onEachFeature: function(f, l) {
                    self.onEachFeature(f, l);
                },
                filter: function(feature, layer) {
                    return true;
                }
            });
        });
    },
    switchLayer: function() {
        console.log(this.model.get("activelayer"));
        this.map.removeLayer(this.geojsonlayer);
        if (this.model.get("activelayer") == "Basins") {
            this.geojsonlayer = this.basinlayer;
        } else if (this.model.get("activelayer") == "Major Basins") {
            this.geojsonlayer = this.majorbasinslayer;
        } else if (this.model.get("activelayer") == "Counties") {
            this.geojsonlayer = this.countylayer;
        }
        this.map.addLayer(this.geojsonlayer);
    },
    onEachFeature: function(feature, layer) {
        var self = this;
        layer.on("click", function(e) {
            self.activateGeo(feature, layer);
        });
        layer.on("mouseover", function(e) {
            var hovertext = feature.properties.name;
            if (self.model.get("geo") !== feature.properties.name) {
                if (feature.properties.ORIG_FID == 5) {
                    layer.setStyle(self.hoverStyleInvalid);
                    hovertext += " (Not in Bay watershed)";
                } else {
                    layer.setStyle(self.hoverStyle);
                }
            }
            $(".geom-hover").html(hovertext);
        });
        layer.on("mouseout", function(e) {
            $(".geom-hover").html("");
            if (self.model.get("geo") === feature.properties.name) {
                if (feature.properties.ORIG_FID == 5) {
                    layer.setStyle(self.selectedStyleInvalid);
                } else {
                    layer.setStyle(self.selectedStyle);
                }
            } else {
                layer.setStyle(self.style);
            }
        });
    },
    activateGeo: function(feature, layer) {
        var self = this;
        self.geojsonlayer.setStyle(self.style);
        if (self.model.get("geo") === layer.feature.properties.name) {
            self.model.set({
                geo: "Maryland"
            });
            layer.setStyle(self.style);
        } else {
            self.model.set({
                geo: layer.feature.properties.name
            });
            if (feature.properties.ORIG_FID == 5) {
                layer.setStyle(self.selectedStyleInvalid);
            } else {
                layer.setStyle(self.selectedStyle);
            }
        }
    }
});

var SolutionsModel = Backbone.Model.extend({
    defaults: {
        title: "Maryland's 2012 - 2013 Milestone Goals and Progress Report",
        stat: "Cover Crops",
        geo: "Maryland",
        zoom: 7,
        lat: 38.8,
        lng: -77.4,
        data: {},
        invalidGeoms: [ "Youghiogheny", "Christina River", "Coastal Bays" ],
        solutions_url: "https://data.maryland.gov/resource/8nvv-y5u6.json?$$app_token=bA8APUlfPGYcccq8XQyyigLag",
        request: null,
        start_year: 2e3,
        end_year: 2013
    },
    getBMPStatistics: function(_geo, _stat) {
        if (this.get("request")) {
            this.get("request").abort();
        }
        var geo = encodeURIComponent(_geo), stat = encodeURIComponent(_stat);
        var url = this.get("solutions_url") + "&$where=basinname='" + geo + "'%20and%20bmpname='" + stat + "'";
        var request = $.ajax({
            dataType: "jsonp",
            jsonp: false,
            url: url + "&$jsonp=BayStat.Solutions.receiveData"
        });
        this.set("request", request);
    }
});

var MenuView = Backbone.View.extend({
    events: {
        "click .stat": "setStat"
    },
    template: BayStat.templates["templates/solutions-menu-template.handlebars"],
    initialize: function() {},
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    setStat: function(e) {
        var $target = $(e.target);
        var stat = $target.html();
        stat = $("<div/>").html(stat).text();
        this.model.set({
            stat: stat
        });
        $("a.stat").removeClass("active");
        $target.addClass("active");
    }
});

var SolutionsView = Backbone.View.extend({
    el: ".dashboard",
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
        var view = new MenuView({
            model: this.model
        });
        $("#menu .inner").html(view.render().el);
        this.map = new MapView({
            model: this.model
        });
        this.makeCharts();
        this.loadData();
    },
    loadData: function() {
        var self = this;
        $.getJSON("data/stats.json", function(res) {
            self.statsData = res;
            self.updateLineChart();
        });
    },
    makeCharts: function() {
        this.chart = new GeoDash.LineChart("#line-chart .chart", {
            x: "date",
            y: "stat",
            width: "auto",
            height: "auto",
            colors: [ "#d80000", "#006200" ],
            interpolate: "monotone",
            axisLabels: true,
            yAxisLabel: ""
        });
        this.pie = new GeoDash.PieChart("#pie .chart", {
            label: "source",
            value: "percent",
            colors: [ "#d80000", "#0B6909", "#f0db4f" ],
            innerRadius: 1,
            drawX: false,
            drawY: false,
            opacity: .8,
            legend: "#pie .legend"
        });
        this.pie.update([ {
            source: "Urban/Suburban",
            percent: 50
        }, {
            source: "Public Land",
            percent: 4
        }, {
            source: "Farms",
            percent: 46
        } ]);
    },
    updateLineChart: function() {
        var self = this;
        if (_.isEmpty(this.model.get("data")) == false) {
            var empty = this.makeEmptyData();
            this.chart.update(empty);
        }
        if (_.contains(this.model.get("invalidGeoms"), this.model.get("geo"))) {
            this.updateLabels([ {} ]);
            this.addNotes([ {} ]);
            var empty = this.makeEmptyData();
            $(".loader").css("opacity", "0");
            this.chart.update(empty);
        } else {
            $(".loader").css("opacity", "1");
            this.model.getBMPStatistics(this.model.get("geo"), this.model.get("stat"));
        }
    },
    receiveData: function(data) {
        var self = this;
        $(".loader").css("opacity", "0");
        self.updateLabels(data);
        self.addNotes(data[0]);
        self.model.set({
            data: data[0]
        });
        var _data = self.prepareData(data[0]);
        self.chart.update(_data);
    },
    makeEmptyData: function() {
        var data = this.model.get("data");
        var keys = _.keys(data);
        _.each(keys, function(key, idx) {
            data[key] = "0";
        });
        return this.prepareData(data);
    },
    prepareData: function(data) {
        var chartData = [];
        var parseDate = d3.time.format("%Y").parse;
        var years = [ 2e3, 2013 ];
        if (_.has(data, "_2013_goal")) {
            goal = +data["_2013_goal"].replace(",", "").replace("*", "");
        } else {
            goal = 0;
        }
        for (var i = this.model.get("start_year"); i <= this.model.get("end_year"); i++) {
            var year = "_" + i, stat = null;
            if (data[year] !== undefined) {
                stat = +data[year].replace(",", "").replace("*", "");
            } else {}
            chartData.push({
                date: parseDate(i.toString()),
                stat: stat,
                goal: goal
            });
        }
        return chartData;
    },
    updateLabels: function(data) {
        var self = this;
        var charttitle = self.model.get("stat") + ": " + self.model.get("geo") + "";
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {
            charttitle = '<span class="text-danger">Not in Bay watershed</span> (' + self.model.get("geo") + " watershed)";
        }
        $("#line-chart .panel-heading").html("<h5>" + charttitle + "</h5>");
        var units = _.where(self.statsData, {
            stat: self.model.get("stat")
        })[0].units;
        $(".units").html(units);
        var units_abbr = _.where(self.statsData, {
            stat: self.model.get("stat")
        })[0].units_abbr;
        this.chart.setYAxisLabel(units_abbr);
        if (_.has(data[0], "_2013_goal")) {
            var overlaytext = "<p>2013: " + this.formatComma(+data[0]["_2013"].replace(",", "").replace("*", "")) + "</p>";
            overlaytext += "<p>2013 Goal: " + this.formatComma(+data[0]["_2013_goal"].replace(",", "").replace("*", "")) + "</p>";
            $(".overlay").html(overlaytext);
        } else {
            $(".overlay").html("");
        }
    },
    goToState: function(e) {
        this.map.geojsonlayer.setStyle(this.map.style);
        this.model.set({
            geo: "Maryland"
        });
        return false;
    },
    addNotes: function(data) {
        var self = this;
        var def = _.where(self.statsData, {
            stat: self.model.get("stat")
        })[0].definition;
        $(".def > .content").html("<p>" + def + "</p>");
        if (data.footnote) {
            $(".rednote").html("<p>" + data.footnote + "</p>");
        } else {
            $(".rednote").html("");
        }
        var notelist = "";
        if (data.note1) {
            notelist += "<ul>";
            notelist += "<li>" + data.note1 + "</li>";
            if (data.note2) {
                notelist += "<li>" + data.note2 + "</li>";
            }
            if (data.note3) {
                notelist += "<li>" + data.note3 + "</li>";
            }
            notelist += "</ul>";
            var html = notelist;
            $(".notes > .content").html(html);
            $(".notes").show();
        } else {
            $(".notes").hide();
        }
    }
});