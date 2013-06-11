function PieChart() {

  var data = [
    {"source":"Urban/Suburban","percent":50},
    {"source":"Public Land","percent":4},
    {"source":"Farms","percent":46}
  ];

  var width = $('#pie .chart').width(),
      height = $('#pie .chart').height(),
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
      .range(["#d80000", "#0B6909", "#EDD70A"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(25);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.percent; });

  var svg = d3.select("#pie .chart").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  data.forEach(function(d) {
    d.percent = +d.percent;
  });

  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d.data.source); })
    .on('mouseover', function(d,i){
      $('#pie .hover-box').html(d.value + '%');
    })
    .on('mouseout', function(d,i){
      $('#pie .hover-box').html('');
    });
}