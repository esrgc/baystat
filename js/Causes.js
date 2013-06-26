function Causes(){
  var self = this;
  this.map = new Map({
    zoom: 8,
    lat: 38.77121,
    lng: -77.31628
  });
  //this.map.map.setView(new L.LatLng(38.77121, -77.31628), 8);
  //this.selectedGeog = 'Maryland';
  console.log(this.map);
  $.getJSON('data/wfr.geojson', function(geojson){
    self.map.addGeoJSON(geojson);
  });
}