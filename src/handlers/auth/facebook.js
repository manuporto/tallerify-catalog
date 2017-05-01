const logger = require('../../utils/logger');
const request = require('request');

const provider = 'https://graph.facebook.com/v2.9/me';

const validateWithProvider = (socialToken) => {
  return new Promise((resolve, reject) => {
    // Send a GET request to Facebook with the token as query string
    request.get({
      url: provider,
      qs: {access_token: socialToken}
    },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          logger.info(`FB GRAPH RESPONSE ${JSON.stringify(response)}`);
          resolve(JSON.parse(body));
        } else {
          logger.warn(`FB GRAPH RESPONSE ${JSON.stringify(response)}`);
          reject(error);
        }
      });
  });
};

const checkCredentials = (credentials) => {
  logger.info(`Validating credentials: ${JSON.stringify(credentials)}`);
  return validateWithProvider(credentials.authToken);
};

module.exports = { checkCredentials };
