function Map(options){
  this.defaults = {
    zoom: 7,
    lat: 38,
    lng: -75
  };
  this.setOptions(options);
  this.selectedGeo = 'Maryland';
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
  this.map = new L.Map('map', {
    attributionControl: false,
    zoomControl: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false
  }).setView(new L.LatLng(this.options.lat, this.options.lng), this.options.zoom);
}

Map.prototype.setOptions = function (options) {
  if(options !== undefined){
    for (var key in this.defaults) {
      if (this.defaults.hasOwnProperty(key)) {
        if (options[key] === undefined) {
          options[key] = this.defaults[key];
        }
      }
    }
    this.options = options;
  } else {
    this.options = this.defaults;
  }
}

Map.prototype.addGeoJSON = function(geojson) {
  var self = this;
  self.geojsonlayer = L.geoJson(geojson, {
    style: function (feature) {
      return self.style;
    },
    onEachFeature: function (feature, layer) {
      console.log(feature);
      layer.bindLabel(feature.properties.STRANAME)
    }
  }).addTo(self.map);

  self.geojsonlayer.on('click', function(x) {
    self.geojsonlayer.setStyle(self.style);
    if(self.selectedGeo === x.layer.feature.properties.WFR) {
      self.selectedGeo = 'Maryland';
      x.layer.setStyle(self.style);
    } else {
      self.selectedGeo = x.layer.feature.properties.WFR;
        x.layer.setStyle(self.selectedStyle);
    }
  });

  self.geojsonlayer.on('mouseover', function(x) {
    if(self.selectedGeo !== x.layer.feature.properties.WFR) {
      x.layer.setStyle(self.hoverStyle);
    }
  });

  self.geojsonlayer.on('mouseout', function(x) {
    if(self.selectedGeo === x.layer.feature.properties.WFR) {
      x.layer.setStyle(self.selectedStyle);
    } else {
      x.layer.setStyle(self.style);
    }
  });
}