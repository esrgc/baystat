$(document).ready(function(){

  var map = new L.Map('map').setView(new L.LatLng(38.85, -77), 7);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

});