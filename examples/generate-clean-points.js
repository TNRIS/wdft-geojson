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
      var urlName = feature.properties['short_name'].toLowerCase().replace(/ /g, '-');

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

      var urlBase = 'http://waterdatafortexas.org/reservoirs/individual/' + urlName;

      var reservoirUrls = {
        'Reservoir Page': urlBase,
        'Recent Graph': urlBase + '/recent-volume@2x.png',
        'Historical Graph': urlBase + '/historical-volume@2x.png',
        'Statistics Graph': urlBase + '/recent-storage-statistics@2x.png'
      };

      R.toPairs(reservoirUrls)
        .forEach(function (pair) {
          var name = pair[0];
          var url = pair[1];
          feature.properties[name] = url;
        });
    });

    this.emit('data', geojson);
  }))
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);
