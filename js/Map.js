var MapView = Backbone.View.extend({
  events: {

  },
  initialize: function() {
    this.defaults = {
      zoom: 7,
      lat: 38,
      lng: -75
    };
    this.style = {
      fillColor: '#fff',
      fillOpacity: 1,
      color: '#000',
      strokeOpacity: 1,
      weight: 1
    };
    this.selectedStyle = {
      color: '#000',
      fillColor: '#19547e',
      fillOpacity: 1,
      weight: 1
    };
    this.hoverStyle = {
      color: '#000',
      fillColor: '#19547e',
      fillOpacity: 1,
      weight: 1
    };
    this.render();
  },
  render: function(){
    var self = this;
    this.map = new L.Map('map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      tap: true
    }).setView(new L.LatLng(this.model.get('lat'), this.model.get('lng')), this.model.get('zoom'));
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/esrgc.mdblur/{z}/{x}/{y}.png').addTo(this.map);
    $.getJSON('data/watershed.geojson', function(geojson){
      self.addGeoJSON(geojson);
    });
  },
  addGeoJSON: function(geojson) {
    var self = this;
    self.geojsonlayer = L.geoJson(geojson, {
      style: function (feature) {
        return self.style;
      },
      onEachFeature: function (feature, layer) {
        //layer.bindLabel(feature.properties.STRANAME);
      }
    }).addTo(self.map);

    self.geojsonlayer.on('click', function(x) {
      self.activateGeo(x.layer);
    });

    self.geojsonlayer.on('mouseover', function(x) {
      if(self.model.get('geo') !== x.layer.feature.properties.STRANAME) {
        x.layer.setStyle(self.hoverStyle);
      }
    });

    self.geojsonlayer.on('mouseout', function(x) {
      if(self.model.get('geo') === x.layer.feature.properties.STRANAME) {
        x.layer.setStyle(self.selectedStyle);
      } else {
        x.layer.setStyle(self.style);
      }
    });
  },
  activateGeo: function(layer){
    var self = this;
    self.geojsonlayer.setStyle(self.style);
    if(self.model.get('geo') === layer.feature.properties.STRANAME) {
      self.model.set({geo: 'Maryland'});
      layer.setStyle(self.style);
    } else {
      self.model.set({geo: layer.feature.properties.STRANAME});
      layer.setStyle(self.selectedStyle);
    }
  }
});