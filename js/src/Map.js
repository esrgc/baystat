var MapView = Backbone.View.extend({
  events: {

  },
  initialize: function() {
    this.listenTo(this.model, 'change:activelayer', this.switchLayer)
    this.defaults = {
      zoom: 7,
      lat: 38,
      lng: -75
    }
    this.style = {
      fillColor: '#fff',
      fillOpacity: 0.5,
      color: '#000',
      strokeOpacity: 1,
      weight: 1
    }
    this.selectedStyle = {
      color: '#000',
      fillColor: '#19547e',
      fillOpacity: 0.9,
      weight: 1
    }
    this.selectedStyleInvalid = {
      color: '#000',
      fillColor: '#878787',
      fillOpacity: 0.9,
      weight: 1
    }
    this.hoverStyle = {
      color: '#000',
      fillColor: '#19547e',
      fillOpacity: 0.7,
      weight: 1
    }
    this.hoverStyleInvalid = {
      color: '#000',
      fillColor: '#ccc',
      fillOpacity: 0.7,
      weight: 1
    }
    this.render()
  },
  render: function() {
    var self = this
    this.map = new L.Map('map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      tap: true
    }).setView(new L.LatLng(this.model.get('lat'), this.model.get('lng')), this.model.get('zoom'))
    $('.leaflet-top.leaflet-right').html('<div class="geom-hover"></div>')
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/esrgc.map-4zj131o4/{z}/{x}/{y}.png').addTo(this.map)
    //L.tileLayer('http://{s}.tiles.mapbox.com/v3/esrgc.mdblur/{z}/{x}/{y}.png').addTo(this.map)
    $.getJSON('data/watershed4.geojson', function(geojson) {
      self.basinlayer = L.geoJson(geojson, {
        style: self.style,
        onEachFeature: function(f, l) { self.onEachFeature(f, l) },
        filter: function(feature, layer) {
            return true
        }
      }).addTo(self.map)
      self.geojsonlayer = self.basinlayer
    })
    $.getJSON('data/majorbasins.geojson', function(geojson) {
      self.majorbasinslayer = L.geoJson(geojson, {
        style: self.style,
        onEachFeature: function(f, l) { self.onEachFeature(f, l) },
        filter: function(feature, layer) {
            return true
        }
      })
    })
    $.getJSON('data/mdcnty3.geojson', function(geojson) {
      self.countylayer = L.geoJson(geojson, {
        style: self.style,
        onEachFeature: function(f, l) { self.onEachFeature(f, l) },
        filter: function(feature, layer) {
            return true
        }
      })
    })
  },
  switchLayer: function() {
    var self = this
    this.map.removeLayer(this.geojsonlayer)
    if (this.model.get('activelayer') == 'Tributary Basins') {
      this.geojsonlayer = this.basinlayer
    } else if (this.model.get('activelayer') == 'Major Basins') {
      this.geojsonlayer = this.majorbasinslayer
    } else if (this.model.get('activelayer') == 'Counties') {
      this.geojsonlayer = this.countylayer
    }
    this.map.addLayer(this.geojsonlayer)
    this.geojsonlayer.eachLayer(function(l) {
      l.setStyle(self.style)
    })
  },
  onEachFeature: function(feature, layer) {
    var self = this
    layer.on('click', function(e) {
      self.activateGeo(feature, layer)
    })
    layer.on('mouseover', function(e) {
      var hovertext = feature.properties.name
      if (self.model.get('geo') !== feature.properties.name) {
        if (feature.properties.ORIG_FID == 5) {
          layer.setStyle(self.hoverStyleInvalid)
          hovertext += ' (Not in Bay watershed)'
        } else {
          layer.setStyle(self.hoverStyle)
        }
      }
      $('.geom-hover').html(hovertext)
    })
    layer.on('mouseout', function(e) {
      $('.geom-hover').html('')
      if (self.model.get('geo') === feature.properties.name) {
        if (feature.properties.ORIG_FID == 5) {
          layer.setStyle(self.selectedStyleInvalid)
        } else {
          layer.setStyle(self.selectedStyle)
        }
      } else {
        layer.setStyle(self.style)
      }
    })
  },
  activateGeo: function(feature, layer) {
    var self = this
    self.geojsonlayer.setStyle(self.style)
    if (self.model.get('geo') === layer.feature.properties.name) {
      self.model.set({geo: 'Maryland'})
      layer.setStyle(self.style)
    } else {
      self.model.set({geo: layer.feature.properties.name})
      if (feature.properties.ORIG_FID == 5) {
        layer.setStyle(self.selectedStyleInvalid)
      } else {
        layer.setStyle(self.selectedStyle)
      }
    }
  }
})
