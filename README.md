# water data for texas - reservoir conditions - geojson
a pair of functions which creates a current reservoir conditions geojson from the [water data for texas](https://waterdatafortexas.org/) database.
Code [request](https://www.npmjs.com/package/request) the source data from [here](http://waterdatafortexas.org/reservoirs/recent-conditions.json)

the two functions which the stream can be passed through:
* stream(options)
    * @param {Object} options - optional declaration of the geometries to be used
* style()
    * *takes no paramters*

## visualization
quick and dirty visualization. for functional examples, see the 'examples' directory of this repo

```javascript
var WDFTGeoJSON = require('wdft-geojson');
var request = require('request');
var JSONStream = require('JSONStream');
var request = require('request');

request.get('http://waterdatafortexas.org/reservoirs/recent-conditions.json')
      .pipe(JSONStream.parse())
      .pipe(WDFTGeoJSON.stream({geometries: reservoirs}))
      .pipe(WDFTGeoJSON.style())
      .pipe(JSONStream.stringify(false))
      .pipe(process.stdout);
```

