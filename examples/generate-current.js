'use strict';
var fs = require('fs');

var JSONStream = require('JSONStream');
var request = require('request');
var WDFTGeojson = require('wdft-geojson');


request.get('http://waterdatafortexas.org/reservoirs/recent-conditions.json')
  .pipe(JSONStream.parse())
  .pipe(WDFTGeojson.stream())
  .pipe(JSONStream.stringify())
  .pipe(process.stdout);
