function Map(){
  this.map = new L.Map('map', {
    attributionControl: false,
    zoomControl: false
  }).setView(new L.LatLng(38.85, -77.4), 7);

  var baseURL = 'http://a.tiles.mapbox.com/v3/esrgc.map-y9awf40v/{z}/{x}/{y}.png';
  var countyURL = 'http://a.tiles.mapbox.com/v3/esrgc.CountyCompare/{z}/{x}/{y}.png';

  // L.tileLayer(baseURL, {
  //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  // }).addTo(this.map);

  L.tileLayer(countyURL).addTo(this.map);

  //this.map.setMaxBounds(this.map.getBounds());
}