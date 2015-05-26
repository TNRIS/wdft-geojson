'use strict';
var fs = require('fs');

var JSONStream = require('JSONStream');
var request = require('request');
var WDFTGeoJSON = require('../lib/index.js');


request.get('http://waterdatafortexas.org/reservoirs/recent-conditions.json')
  .pipe(JSONStream.parse())
  .pipe(WDFTGeoJSON.stream())
  .pipe(WDFTGeoJSON.style())
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);
