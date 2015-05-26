'use strict';

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
        return R.merge({name: pair[0]}, obj);
      })

    var include = [
      "name",
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


module.exports = {
  stream: stream
};
