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
    + "</h4>\n</div>\n<div id=\"map-container\">\n  <div class=\"inner\" id=\"map\"></div>\n</div>\n<div id=\"title\"></div>\n<div id=\"map-intro\">\n  <p>Click map to select a basin.</p>\n  <p>Click <a class=\"state\">here</a> for statewide data.</p>\n</div>\n<div id=\"pollution-menu\"></div>\n<div id=\"layer-menu\"></div>\n<div id=\"pie\">\n  <div class=\"chart\"></div>\n  <div class=\"note\">\n    <p>* Forests naturally contribute a small amount of nutrients and sediment to the Bay, but are not considered to be a pollution source.</p>\n  </div>\n</div>\n<div id=\"source-menu\"></div>\n<div id=\"line\">\n  <div class=\"title\"></div>\n  <div class=\"chart\"></div>\n  <div class=\"legend\">\n    <div class=\"legend-item\"><div class=\"sample primary\"></div><p>Pollution Over Time</p></div>\n    <div class=\"legend-item\">\n      <div class=\"sample secondary\"></div>\n      <select id=\"goal-menu\">\n        <option value=\"milestone2017\">Goal 2017</option>\n        <option value=\"milestone2025\">Goal 2025</option>\n        <option value=\"milestone2017,milestone2025\">2017+2025</option>\n      </select>\n    </div>\n  </div>\n</div>\n<div id=\"details\"></div>\n<div class=\"footer\">\n  <img src=\"img/favicon.png\" /><p>Powered by open data on <a href=\"https://data.maryland.gov/browse?tags=baystat\" target=\"_blank\">https://data.maryland.gov/</a></p>\n</div>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/causes.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <link rel=\"stylesheet\" href=\"css/min/baystat-dashboards.min.css?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, depth0.css_dependencies, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = "";
  buffer += "\n        <link rel=\"stylesheet\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" />\n    ";
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n          <script src=\"js/min/baystat-dashboards.min.js?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></script>\n        ";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n          ";
  stack1 = helpers.each.call(depth0, depth0.js_dependencies, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = "";
  buffer += "\n            <script src=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"></script>\n          ";
  return buffer;
  }

  buffer += "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>Maryland BayStat: Causes</title>\n    <meta name=\"description\" content=\"\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1\">\n    <link rel=\"shortcut icon\" href=\"favicon.ico\" type=\"image/x-icon\">\n    <link rel=\"stylesheet\" href=\"js/lib/leaflet-0.7.2/leaflet.css\" />\n    <link href=\"//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css\" rel=\"stylesheet\">\n";
  stack1 = helpers['if'].call(depth0, depth0.deploy, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <link rel=\"stylesheet\" href=\"css/causes.css?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n  </head>\n  <body>\n    <div class=\"dashboard\"></div>\n      <!--[if lt IE 9]>\n      <script src=\"js/lib/geodash/geodash.ie8.min.js?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" charset=\"utf-8\"></script>\n      <![endif]-->\n      <!--[if (gte IE 9)|!(IE)]><!-->\n      <script src=\"js/lib/geodash/geodash.min.js?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></script>\n      <!--<![endif]-->\n\n        ";
  stack1 = helpers['if'].call(depth0, depth0.deploy, {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        <script>\n          $(function() {\n            BayStat.Causes = new BayStat.CausesView({model: new BayStat.CausesModel()})\n          })\n        </script>\n\n    <script>\n      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n\n      ga('create', 'UA-43402400-1', 'esrgc.org');\n      ga('send', 'pageview');\n\n    </script>\n  </body>\n</html>\n";
  return buffer;
  });

this["BayStat"]["templates"]["templates/layer-menu-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n      <option>";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</option>\n    ";
  return buffer;
  }

  buffer += "<div class=\"menu\">\n  <select id=\"layers\">\n    ";
  stack1 = helpers.each.call(depth0, depth0.layerlist, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </select>\n</div>\n";
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
  


  return "<div class=\"accordion\" id=\"accordion2\">\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseOne\">\n        Implement Best Farming Practices<i class=\"icon-collapse-alt\"></i>\n      </a>\n    </div>\n    <div id=\"collapseOne\" class=\"accordion-body collapse in\">\n      <div class=\"accordion-inner\">\n        <div class=\"list-group\">\n          <a class=\"stat active list-group-item\">Cover Crops</a>\n          <a class=\"stat list-group-item\">Soil Conservation & Water Quality Plans</a>\n          <a class=\"stat list-group-item\">Stream Protection</a>\n          <a class=\"stat list-group-item\">Manure Management Structures</a>\n          <a class=\"stat list-group-item\">Natural Filters on Private Land</a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle collapsed\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseTwo\">\n        Reducing Pollution From Urban Areas<i class=\"icon-collapse-alt\"></i>\n      </a>\n    </div>\n    <div id=\"collapseTwo\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n        <div class=\"list-group\">\n          <a href=\"#\" class=\"stat list-group-item\">Wastewater Treatment Plants ENR</a>\n          <a href=\"#\" class=\"stat list-group-item\">Stormwater Runoff Management Retrofits</a>\n          <a href=\"#\" class=\"stat list-group-item\">Septic Retrofits</a>\n          <a href=\"#\" class=\"stat list-group-item\">Air Pollution Reductions</a>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <a class=\"accordion-toggle collapsed\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseThree\">\n        Public Land Restoration and Conservation<i class=\"icon-collapse-alt\"></i>\n      </a>\n    </div>\n    <div id=\"collapseThree\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n        <div class=\"list-group\">\n          <a href=\"#\" class=\"stat list-group-item\">Natural Filters on Public Land</a>\n          <a href=\"#\" class=\"stat list-group-item\">Program Open Space</a>\n          <a href=\"#\" class=\"stat list-group-item\">CREP Permanent Easements</a>\n          <a href=\"#\" class=\"stat list-group-item\">Rural Legacy</a>\n          <a href=\"#\" class=\"stat list-group-item\">Maryland Environmental Trust</a>\n          <a href=\"#\" class=\"stat list-group-item\">Maryland Agricultural Land Preservation</a>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>";
  });

this["BayStat"]["templates"]["templates/solutions-template.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"header\">\n  <h4>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h4>\n</div>\n<div id=\"intro\">\n  <p>Maryland can only restore the health of the Bay by implementing proven solutions called <strong>Best Management Practices</strong> (BMPs) on the most lands.</p>\n</div>\n<div id=\"map-container\">\n  <div class=\"inner\" id=\"map\"></div>\n</div>\n<div id=\"menu\">\n  <div class=\"inner\"></div>\n</div>\n<div id=\"map-intro\">\n  <div class=\"pull-right\">\n    <p>Click map to select a basin.</br>\n    Click <a class=\"state\">here</a> for statewide data.</p>\n  </div>\n  <div class=\"loader\">\n    <i class=\"icon-refresh icon-spin icon-2x\"></i>\n  </div>\n</div>\n<div id=\"pie\">\n  <div class=\"title\">Percentage of 2014-2015 Nitrogen reductions contributed by the three major sectors.<br><br>See <a href=\"http://www.baystat.maryland.gov/solutions.html\">Solutions front page</a> for more information.</div>\n  <div class=\"chart\"></div>\n</div>\n<div id=\"res\" class=\"panel\">\n  <div class=\"inner\" id=\"line-chart\">\n    <div class=\"panel-heading\"></div>\n    <div class=\"legend-container\">\n      <div class=\"units\"></div>\n      <div class=\"legend\">\n        <div class=\"legend-item\"><div class=\"sample primary\"></div><p>Progress</p></div>\n        <div class=\"legend-item\"><div class=\"sample secondary\"></div><p>2015 Goal</p></div>\n      </div>\n    </div>\n    <div class=\"chart\"></div>\n    <div class=\"rednote\"></div>\n    <div class=\"overlay\"></div>\n  </div>\n</div>\n<div id=\"notes\">\n  <div class=\"inner\">\n    <div class=\"def panel\">\n      <div class=\"panel-heading\">\n        <h6>Definition</h6>\n      </div>\n      <div class=\"content\"></div>\n    </div>\n    <div class=\"notes panel\">\n      <div class=\"panel-heading\">\n        <h6>Notes</h6>\n      </div>\n      <div class=\"content\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"footer\">\n  <img src=\"img/favicon.png\" /><p>Powered by open data on <a href=\"https://data.maryland.gov/browse?tags=baystat\" target=\"_blank\">https://data.maryland.gov/</a></p>\n</div>";
  return buffer;
  });

this["BayStat"]["templates"]["templates/solutions.handlebars"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <link rel=\"stylesheet\" href=\"css/min/baystat-dashboards.min.css?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, depth0.css_dependencies, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = "";
  buffer += "\n        <link rel=\"stylesheet\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" />\n    ";
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <script src=\"js/min/baystat-dashboards.min.js?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></script>\n      ";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        ";
  stack1 = helpers.each.call(depth0, depth0.js_dependencies, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      ";
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = "";
  buffer += "\n          <script src=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"></script>\n        ";
  return buffer;
  }

  buffer += "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">\n    <title>Maryland BayStat: Solutions</title>\n    <meta name=\"description\" content=\"\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1\">\n    <link rel=\"shortcut icon\" href=\"favicon.ico\" type=\"image/x-icon\">\n    <link rel=\"stylesheet\" href=\"js/lib/leaflet-0.7.2/leaflet.css\" />\n    <link href=\"//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css\" rel=\"stylesheet\">\n";
  stack1 = helpers['if'].call(depth0, depth0.deploy, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <link rel=\"stylesheet\" href=\"css/solutions.css?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n  </head>\n  <body>\n    <div class=\"dashboard\"></div>\n      <!--[if lt IE 9]>\n      <script src=\"js/lib/geodash/geodash.ie8.min.js?v=";
  if (stack1 = helpers.version) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" charset=\"utf-8\"></script>\n      <![endif]-->\n      <!--[if (gte IE 9)|!(IE)]><!-->\n      <script src=\"js/lib/geodash/geodash.min.js?v=6.7\"></script>\n      <!--<![endif]-->\n\n      ";
  stack1 = helpers['if'].call(depth0, depth0.deploy, {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      <script>\n        $(function() {\n          BayStat.Solutions = new BayStat.SolutionsView({model: new BayStat.SolutionsModel()})\n        })\n      </script>\n\n  <script>\n    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n\n    ga('create', 'UA-43402400-1', 'esrgc.org');\n    ga('send', 'pageview');\n\n  </script>\n  </body>\n</html>\n";
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