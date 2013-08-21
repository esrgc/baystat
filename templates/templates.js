this["BayStat"] = this["BayStat"] || {};
this["BayStat"]["templates"] = this["BayStat"]["templates"] || {};

this["BayStat"]["templates"]["templates/causes-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"header\">\n  <h4>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h4>\n</div>\n<div id=\"map-container\">\n  <div class=\"inner\" id=\"map\"></div>\n</div>\n<div id=\"title\"></div>\n<div id=\"map-intro\">\n  <p>Click map to select a basin.</p>\n  <p>Click <a class=\"state\">here</a> for statewide data.</p>\n</div>\n<div id=\"pollution-menu\"></div>\n<div id=\"data-source\">\n  <p>Data source:  EPA Phase 5.3.2 Watershed Model</p>\n</div>\n<div id=\"pie\">\n  <div class=\"chart\"><div class=\"hoverbox\"></div></div>\n  <div class=\"legend\"></div>\n  <div class=\"note\">\n    <p>* Forests naturally contribute a small amount of nutrients and sediment to the Bay, but are not considered to be a pollution source.</p>\n  </div>\n</div>\n<div id=\"source-menu\"></div>\n<div id=\"line\">\n  <div class=\"title\"></div>\n  <div class=\"chart\"></div>\n  <div class=\"legend\">\n    <div class=\"legend-item\"><div class=\"sample primary\"></div><p>Pollution Over Time</p></div>\n    <div class=\"legend-item\"><div class=\"sample secondary\"></div><p>TMDL Goal (2017)</p></div>\n  </div>\n</div>\n<div id=\"details\"></div>\n<div class=\"footer\">\n  <img src=\"img/favicon.png\" /><p>Powered by open data on <a href=\"https://data.maryland.gov/\">https://data.maryland.gov/</a></p>\n</div>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/pollution-menu-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n    <label class=\"radio\">\n      <input type=\"radio\" name=\"optionsRadios\" class=\"pollutionRadio\" value=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" >\n      "
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\n    </label>\n  ";
  return buffer;
  }

  buffer += "<form id=\"pollution\" class=\"form-inline\">\n  ";
  stack1 = helpers.each.call(depth0, depth0.pollutionlist, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</form>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/solutions-menu-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"accordion\" id=\"accordion2\">\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseOne\">\n        Implement Best Farming Practices<i class=\"icon-collapse-alt\"></i>\n      </a>\n    </div>\n    <div id=\"collapseOne\" class=\"accordion-body collapse in\">\n      <div class=\"accordion-inner\">\n        <div class=\"list-group\">\n          <a class=\"stat active list-group-item\">Cover Crops</a>\n          <a class=\"stat list-group-item\">Soil Conservation & Water Quality Plans</a>\n          <a class=\"stat list-group-item\">Stream Protection</a>\n          <a class=\"stat list-group-item\">Manure Management Structures</a>\n          <a class=\"stat list-group-item\">Natural Filters on Private Land</a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle collapsed\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseTwo\">\n        Reducing Pollution From Urban Areas<i class=\"icon-collapse-alt\"></i>\n      </a>\n    </div>\n    <div id=\"collapseTwo\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n        <div class=\"list-group\">\n          <a href=\"#\" class=\"stat list-group-item\">Wastewater Treatment Plants ENR</a>\n          <a href=\"#\" class=\"stat list-group-item\">Stormwater Runoff Management Retrofits</a>\n          <a href=\"#\" class=\"stat list-group-item\">Septic Retrofits</a>\n          <a href=\"#\" class=\"stat list-group-item\">Air Pollution Reductions</a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle collapsed\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseThree\">\n        Public Land Resoration and Conservation<i class=\"icon-collapse-alt\"></i>\n      </a>\n    </div>\n    <div id=\"collapseThree\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n        <div class=\"list-group\">\n          <a href=\"#\" class=\"stat list-group-item\">Natural Filters on Public Land</a>\n          <a href=\"#\" class=\"stat list-group-item\">Program Open Space</a>\n          <a href=\"#\" class=\"stat list-group-item\">CREP Permanent Easements</a>\n          <a href=\"#\" class=\"stat list-group-item\">Rural Legacy</a>\n          <a href=\"#\" class=\"stat list-group-item\">Maryland Environmental Trust</a>\n          <a href=\"#\" class=\"stat list-group-item\">Maryland Agricultural Land Preservation</a>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>";
  });

this["BayStat"]["templates"]["templates/solutions-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"header\">\n  <h4>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h4>\n</div>\n<div id=\"intro\">\n  <p>Maryland can only restore the health of the Bay by implementing proven solutions called Best Management Practices (BMPs) on the most lands.</p>\n</div>\n<div id=\"map-container\">\n  <div class=\"inner\" id=\"map\"></div>\n</div>\n<div id=\"menu\">\n  <div class=\"inner\"></div>\n</div>\n<div id=\"map-intro\">\n  <div class=\"pull-right\">\n    <p>Click map to select a basin.</br>\n    Click <a class=\"state\">here</a> for statewide data.</p>\n  </div>\n  <div class=\"loader\">\n    <i class=\"icon-refresh icon-spin icon-2x\"></i>\n  </div>\n</div>\n<div id=\"pie\">\n  <div class=\"title\">2012-2013 nitrogen reductions are planned for the following sources (preliminary estimate):</div>\n  <div class=\"chart\">\n    <div class=\"hoverbox\"></div>\n  </div>\n  <div class=\"hover-box\"></div>\n  <div class=\"legend\"></div>\n</div>\n<div id=\"res\" class=\"panel\">\n  <div class=\"inner\" id=\"line-chart\">\n    <div class=\"panel-heading\"></div>\n    <div class=\"chart\">\n      <div class=\"legend-container\">\n        <div class=\"units\"></div>\n        <div class=\"legend\">\n          <div class=\"legend-item\"><div class=\"sample primary\"></div><p>Progress</p></div>\n          <div class=\"legend-item\"><div class=\"sample secondary\"></div><p>2013 Goal</p></div>\n        </div>\n      </div>\n      <div class=\"rednote\"></div>\n      <div class=\"overlay\"></div>\n    </div>\n  </div>\n</div>\n<div id=\"notes\">\n  <div class=\"inner\">\n    <div class=\"def panel\">\n      <div class=\"panel-heading\">\n        <h6>Definition</h6>\n      </div>\n      <div class=\"content\"></div>\n    </div>\n    <div class=\"notes panel\">\n      <div class=\"panel-heading\">\n        <h6>Notes</h6>\n      </div>\n      <div class=\"content\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"footer\">\n  <img src=\"img/favicon.png\" /><p>Powered by open data on <a href=\"https://data.maryland.gov/\">https://data.maryland.gov/</a></p>\n</div>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/source-menu-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n      <option>"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</option>\n    ";
  return buffer;
  }

  buffer += "\n<div class=\"menu-label\" for=\"source\">Pollution Source: </div>\n<div class=\"menu\">\n  <select id=\"source\">\n    ";
  stack1 = helpers.each.call(depth0, depth0.sourcelist, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </select>\n</div>\n";
  return buffer;
  });