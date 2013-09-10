this["BayStat"] = this["BayStat"] || {};
this["BayStat"]["templates"] = this["BayStat"]["templates"] || {};

this["BayStat"]["templates"]["templates/causes-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"header\">\r\n  <h4>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h4>\r\n</div>\r\n<div id=\"map-container\">\r\n  <div class=\"inner\" id=\"map\"></div>\r\n</div>\r\n<div id=\"title\"></div>\r\n<div id=\"map-intro\">\r\n  <p>Click map to select a basin.</p>\r\n  <p>Click <a class=\"state\">here</a> for statewide data.</p>\r\n</div>\r\n<div id=\"pollution-menu\"></div>\r\n<div id=\"data-source\">\r\n  <p>Data source:  EPA Phase 5.3.2 Watershed Model</p>\r\n</div>\r\n<div id=\"pie\">\r\n  <div class=\"chart\"><div class=\"hoverbox\"></div></div>\r\n  <div class=\"legend\"></div>\r\n  <div class=\"note\">\r\n    <p>* Forests naturally contribute a small amount of nutrients and sediment to the Bay, but are not considered to be a pollution source.</p>\r\n  </div>\r\n</div>\r\n<div id=\"source-menu\"></div>\r\n<div id=\"line\">\r\n  <div class=\"title\"></div>\r\n  <div class=\"chart\"></div>\r\n  <div class=\"legend\">\r\n    <div class=\"legend-item\"><div class=\"sample primary\"></div><p>Pollution Over Time</p></div>\r\n    <div class=\"legend-item\"><div class=\"sample secondary\"></div><p>TMDL Goal (2017)</p></div>\r\n  </div>\r\n</div>\r\n<div id=\"details\"></div>\r\n<div class=\"footer\">\r\n  <img src=\"img/favicon.png\" /><p>Powered by open data on <a href=\"https://data.maryland.gov/profile/ESRGC/2ryv-bq8b?q=baystat%20%2B%20causes\" target=\"_blank\">https://data.maryland.gov/</a></p>\r\n</div>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/pollution-menu-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\r\n    <label class=\"radio\">\r\n      <input type=\"radio\" name=\"optionsRadios\" class=\"pollutionRadio\" value=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" >\r\n      "
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\r\n    </label>\r\n  ";
  return buffer;
  }

  buffer += "<form id=\"pollution\" class=\"form-inline\">\r\n  ";
  stack1 = helpers.each.call(depth0, depth0.pollutionlist, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</form>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/solutions-menu-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"accordion\" id=\"accordion2\">\r\n  <div class=\"accordion-group\">\r\n    <div class=\"accordion-heading\">\r\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseOne\">\r\n        Implement Best Farming Practices<i class=\"icon-collapse-alt\"></i>\r\n      </a>\r\n    </div>\r\n    <div id=\"collapseOne\" class=\"accordion-body collapse in\">\r\n      <div class=\"accordion-inner\">\r\n        <div class=\"list-group\">\r\n          <a class=\"stat active list-group-item\">Cover Crops</a>\r\n          <a class=\"stat list-group-item\">Soil Conservation & Water Quality Plans</a>\r\n          <a class=\"stat list-group-item\">Stream Protection</a>\r\n          <a class=\"stat list-group-item\">Manure Management Structures</a>\r\n          <a class=\"stat list-group-item\">Natural Filters on Private Land</a>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"accordion-group\">\r\n    <div class=\"accordion-heading\">\r\n      <a class=\"accordion-toggle collapsed\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseTwo\">\r\n        Reducing Pollution From Urban Areas<i class=\"icon-collapse-alt\"></i>\r\n      </a>\r\n    </div>\r\n    <div id=\"collapseTwo\" class=\"accordion-body collapse\">\r\n      <div class=\"accordion-inner\">\r\n        <div class=\"list-group\">\r\n          <a href=\"#\" class=\"stat list-group-item\">Wastewater Treatment Plants ENR</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">Stormwater Runoff Management Retrofits</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">Septic Retrofits</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">Air Pollution Reductions</a>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"accordion-group\">\r\n    <div class=\"accordion-heading\">\r\n      <a class=\"accordion-toggle collapsed\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseThree\">\r\n        Public Land Restoration and Conservation<i class=\"icon-collapse-alt\"></i>\r\n      </a>\r\n    </div>\r\n    <div id=\"collapseThree\" class=\"accordion-body collapse\">\r\n      <div class=\"accordion-inner\">\r\n        <div class=\"list-group\">\r\n          <a href=\"#\" class=\"stat list-group-item\">Natural Filters on Public Land</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">Program Open Space</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">CREP Permanent Easements</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">Rural Legacy</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">Maryland Environmental Trust</a>\r\n          <a href=\"#\" class=\"stat list-group-item\">Maryland Agricultural Land Preservation</a>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>";
  });

this["BayStat"]["templates"]["templates/solutions-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"header\">\r\n  <h4>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h4>\r\n</div>\r\n<div id=\"intro\">\r\n  <p>Maryland can only restore the health of the Bay by implementing proven solutions called <strong>Best Management Practices</strong> (BMPs) on the most lands.</p>\r\n</div>\r\n<div id=\"map-container\">\r\n  <div class=\"inner\" id=\"map\"></div>\r\n</div>\r\n<div id=\"menu\">\r\n  <div class=\"inner\"></div>\r\n</div>\r\n<div id=\"map-intro\">\r\n  <div class=\"pull-right\">\r\n    <p>Click map to select a basin.</br>\r\n    Click <a class=\"state\">here</a> for statewide data.</p>\r\n  </div>\r\n  <div class=\"loader\">\r\n    <i class=\"icon-refresh icon-spin icon-2x\"></i>\r\n  </div>\r\n</div>\r\n<div id=\"pie\">\r\n  <div class=\"title\">2012-2013 nitrogen reductions are planned for the following sources (preliminary estimate):</div>\r\n  <div class=\"chart\">\r\n    <div class=\"hoverbox\"></div>\r\n  </div>\r\n  <div class=\"hover-box\"></div>\r\n  <div class=\"legend\"></div>\r\n</div>\r\n<div id=\"res\" class=\"panel\">\r\n  <div class=\"inner\" id=\"line-chart\">\r\n    <div class=\"panel-heading\"></div>\r\n    <div class=\"legend-container\">\r\n      <div class=\"units\"></div>\r\n      <div class=\"legend\">\r\n        <div class=\"legend-item\"><div class=\"sample primary\"></div><p>Progress</p></div>\r\n        <div class=\"legend-item\"><div class=\"sample secondary\"></div><p>2013 Goal</p></div>\r\n      </div>\r\n    </div>\r\n    <div class=\"chart\"></div>\r\n    <div class=\"rednote\"></div>\r\n    <div class=\"overlay\"></div>\r\n  </div>\r\n</div>\r\n<div id=\"notes\">\r\n  <div class=\"inner\">\r\n    <div class=\"def panel\">\r\n      <div class=\"panel-heading\">\r\n        <h6>Definition</h6>\r\n      </div>\r\n      <div class=\"content\"></div>\r\n    </div>\r\n    <div class=\"notes panel\">\r\n      <div class=\"panel-heading\">\r\n        <h6>Notes</h6>\r\n      </div>\r\n      <div class=\"content\"></div>\r\n    </div>\r\n  </div>\r\n</div>\r\n<div class=\"footer\">\r\n  <img src=\"img/favicon.png\" /><p>Powered by open data on <a href=\"https://data.maryland.gov/Energy-and-Environment/BayStat-Solutions/8nvv-y5u6\" target=\"_blank\">https://data.maryland.gov/</a></p>\r\n</div>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/source-menu-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\r\n      <option>"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</option>\r\n    ";
  return buffer;
  }

  buffer += "\r\n<div class=\"menu-label\" for=\"source\">Pollution Source: </div>\r\n<div class=\"menu\">\r\n  <select id=\"source\">\r\n    ";
  stack1 = helpers.each.call(depth0, depth0.sourcelist, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n  </select>\r\n</div>\r\n";
  return buffer;
  });