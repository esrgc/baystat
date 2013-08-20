/*! 
baystat-dashboards v0.3.17 2013-08-20 
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
        pollutionlist: [ "Nitrogen", "Phosphorus", "Sediment" ],
        sourcelist: [ "All Causes", "Farms", "Forests", "Septic", "Stormwater Runoff", "Wastewater Treatment Plants" ],
        invalidGeoms: [ "Youghiogheny", "Christina River", "Coastal Bays" ],
        pie_colors: [ "#f0db4f", "#d80000", "#66adda", "#A278C1", "#0B6909", "#ff6600", "#a882c5" ]
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
        this.listenTo(this.model, "change:source", this.getSocrataStat);
        this.listenTo(this.model, "change:geo", this.getSocrataStat);
        this.listenTo(this.model, "change:pollution", this.getSocrataStat);
        this.listenTo(this.model, "change:geo", this.getPieStats);
        this.listenTo(this.model, "change:pollution", this.getPieStats);
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
        this.getSocrataStat();
        this.getPieStats();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        var view = new PollutionMenuView({
            model: this.model
        });
        $("#pollution-menu").html(view.render().el);
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
            interpolate: "linear",
            axisLabels: true,
            yAxisLabel: "Pounds Per Year"
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
    getPieStats: function() {
        var self = this;
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
            $.getJSON("api/bay/stat/sources/" + self.model.get("pollution") + "/" + self.model.get("geo"), function(res) {
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
            });
        }
    },
    getSocrataStat: function() {
        var self = this;
        self.chart.update(self.emptyData);
        self.updateLabels();
        this.chart.setYAxisLabel(self.labels[self.model.get("pollution")]);
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {} else {
            $.getJSON("api/bay/stat/causes/" + self.model.get("pollution") + "/" + self.model.get("source") + "/" + self.model.get("geo"), function(res) {
                var data = self.prepareData(res);
                self.chart.update(data);
                self.updateLabels();
            });
        }
    },
    updateLabels: function() {
        var self = this;
        var charttitle = "<h5>" + self.model.get("pollution") + " pollution from " + self.model.get("source") + " in " + self.model.get("geo") + "</h5>";
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {
            charttitle = "<h5>This basin is in the " + self.model.get("geo") + " watershed. (Not in Bay watershed)</h5>";
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
            self.geojsonlayer = L.geoJson(geojson, {
                style: self.style,
                onEachFeature: function(f, l) {
                    self.onEachFeature(f, l);
                },
                filter: function(feature, layer) {
                    return true;
                }
            }).addTo(self.map);
        });
    },
    onEachFeature: function(feature, layer) {
        var self = this;
        layer.on("click", function(e) {
            self.activateGeo(feature, layer);
        });
        layer.on("mouseover", function(e) {
            var hovertext = feature.properties.STRANAME;
            if (self.model.get("geo") !== feature.properties.STRANAME) {
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
            if (self.model.get("geo") === feature.properties.STRANAME) {
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
        if (self.model.get("geo") === layer.feature.properties.STRANAME) {
            self.model.set({
                geo: "Maryland"
            });
            layer.setStyle(self.style);
        } else {
            self.model.set({
                geo: layer.feature.properties.STRANAME
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
        invalidGeoms: [ "Youghiogheny", "Christina River", "Coastal Bays" ]
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
        this.listenTo(this.model, "change:stat", this.getSocrataStat);
        this.listenTo(this.model, "change:geo", this.getSocrataStat);
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
            self.getSocrataStat();
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
    getStats: function() {
        $.getJSON("api/bay/stats/", function(res) {
            res.forEach(function(stat) {});
        });
    },
    getSocrataStat: function() {
        var self = this;
        if (_.isEmpty(this.model.get("data")) == false) {
            var empty = this.makeEmptyData();
            this.chart.update(empty);
        }
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {
            self.updateLabels([ {} ]);
            self.addNotes([ {} ]);
        } else {
            $(".loader").css("opacity", "1");
            $.getJSON("api/bay/stat/solutions/" + self.model.get("stat") + "/" + self.model.get("geo"), function(res) {
                $(".loader").css("opacity", "0");
                self.updateLabels(res);
                self.addNotes(res[0]);
                self.model.set({
                    data: res[0]
                });
                var data = self.prepareData(res[0]);
                self.chart.update(data);
            });
        }
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
        for (var i = 2e3; i <= 2013; i++) {
            var year = "_" + i, stat;
            if (data[year] === undefined) {
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
        for (var year = 2e3; year <= 2013; year++) {
            var goal;
            if (_.has(data, "_2013_goal")) {
                goal = +data["_2013_goal"].replace(",", "").replace("*", "");
            } else {
                goal = 0;
            }
            if (chartData[idx]) {
                chartData[idx]["goal"] = goal;
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
    updateLabels: function(data) {
        var self = this;
        var charttitle = self.model.get("stat") + " (" + self.model.get("geo") + ")";
        if (_.contains(self.model.get("invalidGeoms"), self.model.get("geo"))) {
            charttitle += " (Not in Bay watershed)";
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
    setStat: function(e) {
        var self = this;
        var $target = $(e.target);
        var stat = $target.html();
        self.stat = $("<div/>").html(stat).text();
        $("a.stat").removeClass("active");
        $(this).addClass("active");
        self.getSocrataStat(self.stat, self.geo);
        return false;
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