# water data for texas - reservoir conditions - geojson
a group of functions which scrapes the current reservoir conditions from the water data for texas server and generates a geojson within Amazon S3. designed to be an lambda function.

### setup

cd into this repo and run `npm install` to install node dependencies from package.json

### test run locally

the functions can create either a polygon or point geometry geojson file from the scraped data. you can manually run these to scrape the data, generate the geojson, and upload to S3 with:
* `node -e 'require("./examples/generate-clean-polygons").handler()'`
* `node -e 'require("./examples/generate-clean-points").handler()'`

### deploy

deployed from the 'aws-tnris-deployments' repo. to deploy manually:
1. run the setup installation
1. zip up the contents of the repo
1. upload to aws lambda with a Node.js 6.10 runtime.
1. points vs polygons will need to be deployed as separate lambda functions. the difference is between the chosen handler:
    * examples/generate-clean-polygons.handler
    * examples/generate-clean-points.handler

