"use strict";

var theme_path = process.env.PWD;
var path = require("path");
var fs   = require("fs");
var glob = require("glob");
var yaml = require("js-yaml");
var breakpoints = yaml.safeLoad(fs.readFileSync(theme_path + '/breathy.breakpoints.yml', 'utf8'));

var dir = fs.readdirSync(theme_path);

var breakpointsFile = glob.sync("*.breakpoints.yml", {"cwd": theme_path});

var breakpoints = yaml.safeLoad(fs.readFileSync(breakpointsFile[0], 'utf8'));
function getMediaQuery(label) {
  for(var breakpoint in breakpoints) {
    var currentBreakpoint = breakpoints[breakpoint];

    if (currentBreakpoint.label === label) {
      return currentBreakpoint.mediaQuery;
    }
  }
}

module.exports = function(eyeglass, sass) {
  return {
    sassDir: path.join(__dirname, "sass"),
    functions: {
      "get-breakpoint($label)": function(label, done) {
        var label = label.getValue();

        done(sass.types.String(getMediaQuery(label)));
      }
    }
  }
};
