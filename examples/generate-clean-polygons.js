'use strict';
var fs = require('fs');
var path = require('path');

var es = require('event-stream');
var JSONStream = require('JSONStream');
var request = require('request');
var R = require('ramda');
var through = require('through');
var minimist = require('minimist');

var WDFTGeoJSON = require('../lib/index.js');


var DEFAULT_RESERVOIRS_PATH = path.resolve(__dirname, '../data/reservoirs-simplified.geojson');
var argv = minimist(process.argv.slice(2));
var reservoirs_geojson_file = argv._.length ? argv._[0] : DEFAULT_RESERVOIRS_PATH;

fs.createReadStream(reservoirs_geojson_file)
  .pipe(JSONStream.parse())
  .pipe(es.writeArray(function(err, array) {
    var reservoirs = {};

    array[0].features.forEach(function(reservoir) {
      reservoirs[reservoir.properties.Name] = reservoir.geometry;
    });

    request.get('http://waterdatafortexas.org/reservoirs/recent-conditions.json')
      .pipe(JSONStream.parse())
      .pipe(WDFTGeoJSON.stream({geometries: reservoirs}))
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
          'marker-color': 'marker-color',
          'fill': 'fill',
          'stroke': 'stroke'
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

        //geojson.features = geojson.features.filter(function(f) {return f.geometry.type != 'Point'});
        this.emit('data', geojson);
      }))
      .pipe(JSONStream.stringify(false))
      .pipe(process.stdout);

}));

