'use strict';

const got = require('got');

module.exports.apiaiHook = (event, context, callback) => {
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

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

function formatMins(mins) {
  if (mins > 10) return mins.toFixed(0);
  return mins.toFixed(1);
}
