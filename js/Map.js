function Map(){
  this.style = {
    color: '#333',
    fillColor: '#fff',
    fillOpacity: 0.9,
    weight: 1
  };
  this.selectedStyle = {
    color: '#333',
    fillColor: '#f00',
    fillOpacity: 0.9,
    weight: 1
  };
  this.map = new L.Map('map', {
    attributionControl: false,
    zoomControl: false,
    dragging: false
  }).setView(new L.LatLng(38.55, -77.4), 7);
}

Map.prototype.addGeoJSON = function(geojson) {
  var self = this;
  self.geojsonlayer = L.geoJson(geojson, {
    style: function (feature) {
      return self.style;
    },
    onEachFeature: function (feature, layer) {
      
    }
  }).addTo(self.map);

  self.geojsonlayer.on('click', function(x) {
    self.geojsonlayer.setStyle(self.style);
    if(self.selectedGeog === x.layer.feature.properties.WFR) {
      self.selectedGeog = 'Maryland';
      x.layer.setStyle(self.style);
    } else {
      self.selectedGeog = x.layer.feature.properties.WFR;
        x.layer.setStyle(self.selectedStyle);
    }
  });
}