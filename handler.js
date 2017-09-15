'use strict';

const got = require('got');

var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  // apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
  // formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

module.exports.apiaiHook = (event, context, callback) => {
  console.log(event);

  const body = JSON.parse(event.body);

  switch (body.result.action) {
    case 'fetch.next5':
      got(process.env.PTV_URL, { json: true })
      .then(r => r.body)
      .then(body => {
        const next = body.departures[0];
        const date = new Date(next.estimated_departure_utc || next.scheduled_departure_utc);
        const diff = (date - new Date()) / 60000;
        const response = {
          statusCode: 200,
          body: JSON.stringify({
            speech: `The next service departs in ${formatMins(diff)} minutes`
          }),
        };

        callback(null, response);
      })
      .catch(err => {
        callback(err);
      });
      break;
    case 'favourite.set':
      geocoder.geocode(body.parameters.address + ', Melbourne, Australia')
      .then((res) => {
        callback({
          speech: `You're near ${res[0].latitude}, ${res[0].longitude}`
        });
        console.log(res[0]);
      })
      .catch((err) => {
        callback(err);
      });
      break;
    default:
      callback(new Error('Whaaaat?'));
      break;
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

function formatMins(mins) {
  if (mins > 10) return mins.toFixed(0);
  return mins.toFixed(1);
}
