'use strict';
var fs = require('fs');

var JSONStream = require('JSONStream');
var request = require('request');
var R = require('ramda');
var through = require('through');
var WDFTGeoJSON = require('../lib/index.js');


request.get('http://waterdatafortexas.org/reservoirs/recent-conditions.json')
  .pipe(JSONStream.parse())
  .pipe(WDFTGeoJSON.stream())
  .pipe(WDFTGeoJSON.style())
  .pipe(through(function write(geojson) {
    var renameProperties = {
      full_name: 'Name',
      timestamp: 'Date',
      percent_full: 'Percent Full',
      elevation: 'Water Surface Elevation',
      volume: 'Reservoir Storage',
      conservation_pool_elevation: 'Conservation Pool Elevation',
      conservation_storage: 'Conservation Storage',
      conservation_capacity: 'Conservation Capacity',
      area: 'Surface Area',
      'marker-color': 'marker-color'
    };

    geojson.features.forEach(function rename(feature) {
      R.toPairs(renameProperties)
        .forEach(function (pair) {
          var from = pair[0];
          var to = pair[1];
          feature.properties[to] = feature.properties[from];
          if (from !== to) {
            delete feature.properties[from];
          }
        });

      feature.properties = R.pick(R.values(renameProperties), feature.properties);
    });

    geojson.legend.title = renameProperties['percent_full'];
    this.emit('data', geojson);
  }))
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);
