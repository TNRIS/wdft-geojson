'use strict';

var geocolor = require('geocolor');
var geojson = require('geojson');
var R = require('ramda');
var request = require('request');
var through = require('through');


function stream() {
  function write(conditions) {
    var stream = this;

    var flat = R.toPairs(conditions)
      .map(function (pair) {
        var obj = pair[1];
        var location = obj.gauge_location;
        obj.lng = location.coordinates[0];
        obj.lat = location.coordinates[1];
        delete obj.gauge_location;
        return obj;
      })

    var include = [
      "area",
      "condensed_name",
      "conservation_capacity",
      "conservation_pool_elevation",
      "conservation_storage",
      "dead_pool_elevation",
      "elevation",
      "full_name",
      "percent_full",
      "short_name",
      "timestamp",
      "volume",
      "volume_under_conservation_pool_elevation",
    ];

    var geojsonConditions = geojson.parse(flat, {Point: ['lat', 'lng']}, include);
    stream.emit('data', geojsonConditions);
  };

  return through(write);
}

function style() {
  function write(geojson) {
    var stream = this;

    var colors = [
        '#990000',
        '#D73027',
        '#F46D43',
        '#FDAE61',
        '#FFCC33',
        '#FEE090',
        '#FFFF99',
        '#CCFFFF',
        '#3399FF',
        '#0000FF'
    ];

    var breaks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

    var styled = geocolor.custom(geojson, 'percent_full', breaks, colors);

    stream.emit('data', styled);
  };

  return through(write);
}


module.exports = {
  stream: stream,
  style: style
};
