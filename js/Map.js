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
      fillOpacity: 0.5,
      color: '#000',
      strokeOpacity: 1,
      weight: 1
    };
    this.selectedStyle = {
      color: '#000',
      fillColor: '#19547e',
      fillOpacity: 0.9,
      weight: 1
    };
    this.hoverStyle = {
      color: '#000',
      fillColor: '#19547e',
      fillOpacity: 0.7,
      weight: 1
    };
    this.render();
  },
  render: function(){
    var self = this;
    this.map = new L.Map('map', {
      attributionControl: false,
      zoomControl: false,
      //dragging: false,
      touchZoom: false,
      //scrollWheelZoom: false,
      doubleClickZoom: false,
      tap: true
    }).setView(new L.LatLng(this.model.get('lat'), this.model.get('lng')), this.model.get('zoom'));
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/esrgc.map-4zj131o4/{z}/{x}/{y}.png').addTo(this.map);
    //L.tileLayer('http://{s}.tiles.mapbox.com/v3/esrgc.mdblur/{z}/{x}/{y}.png').addTo(this.map);
    $.getJSON('data/watershed.geojson', function(geojson){
      self.geojsonlayer = L.geoJson(geojson, {
        style: self.style,
        onEachFeature: function(f, l) { self.onEachFeature(f, l); }
      }).addTo(self.map);
    });
  },
  onEachFeature: function(feature, layer){
    var self = this;
    layer.on('click', function(e) {
      self.activateGeo(layer);
    });

    layer.on('mouseover', function(e) {
      if(self.model.get('geo') !== feature.properties.STRANAME) {
        layer.setStyle(self.hoverStyle);
      }
    });

    layer.on('mouseout', function(e) {
      if(self.model.get('geo') === feature.properties.STRANAME) {
        layer.setStyle(self.selectedStyle);
      } else {
        layer.setStyle(self.style);
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