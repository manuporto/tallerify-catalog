const logger = require('../../utils/logger');
const request = require('request');

const provider = 'https://graph.facebook.com/v2.9/me';

const validateWithProvider = (socialToken) => {
  return new Promise((resolve, reject) => {
    // Send a GET request to Facebook with the token as query string
    request.get({
      url: provider,
      oauth: socialToken,
      json: true,
    },
      (error, response, body) => {
        logger.warn(`FB GRAPH RESPONSE ${JSON.stringify(response)}`);
        if (!error && response.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      });
  });
};

const checkCredentials = (credentials) => {
  logger.info(`Validating credentials: ${JSON.stringify(credentials)}`);
  logger.info('TODO oops'); // TODO
};

module.exports = { checkCredentials };
