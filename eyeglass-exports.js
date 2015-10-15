"use strict";

var theme_path = process.env.PWD;
var path = require('path');
var fs   = require('fs');
var glob = require('glob');
var yaml = require('js-yaml');
var dir = fs.readdirSync(theme_path);
var breakpointsFile = glob.sync('*.breakpoints.yml', {'cwd': theme_path});
var breakpoints = yaml.safeLoad(fs.readFileSync(breakpointsFile[0], 'utf8'));

/**
 * Custom Function to get the value of a media query
 * from our .breakpoints.yml.
 *
 * @param {String} targetLabel
 *   The human readable name of the 'label' key for the breakpoint.
 * @param {String} targetGroup
 *   The name prefixes the breakpoint group name. For example: if the breakpoint
 *   was `foo.bar: { ...` then the group name is "foo".
 */
var getMediaQuery = function(targetLabel, targetGroup) {
  // Loop over all our breakpoints.
  for(var breakpoint in breakpoints) {
    // Get the contents of the current breakpoint.
    var currentBreakpoint = breakpoints[breakpoint];

    // If a the value of group is not empty.
    if (targetGroup.length) {
      // Get the current breakpoint group we are on.
      var currentGroup = breakpoint.match(/^([\w\-]+)/);

      // If the current group matches the target group
      // then return the query.
      if (currentGroup[0] === targetGroup) {
        if (currentBreakpoint.label === targetLabel) {
          return currentBreakpoint.mediaQuery;
        }
      }
    }

    // If no group is listed, just return the media query for
    // the 1st item that matches our target label
    else if (currentBreakpoint.label === targetLabel) {
      return currentBreakpoint.mediaQuery;
    }
  }
}

module.exports = function(eyeglass, sass) {
  return {
    sassDir: path.join(__dirname, 'sass'),
    functions: {
      "dsb($label, $group: '')": function(label, group, done) {

        var label = label.getValue();
        var group = group.getValue();

        var mediaQuery = getMediaQuery(label, group);
        // If no media query is found then throw an error.
        if (typeof mediaQuery !== 'undefined') {
          done(sass.types.String(getMediaQuery(label, group)));
        }
        else {
          throw 'Unable to find a breakpoint within the "' + group + '" group with a label of "' + label + '" in the file ' + breakpointsFile + '.';
        }
      }
    }
  }
};
