const middy = require('@middy/core');
const httpJsonParser = require('@middy/http-json-body-parser');
const httpEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');

module.exports.commonPublicMiddleware = handler => middy(handler)
  .use([
    httpJsonParser(),
    httpErrorHandler(),
    httpEventNormalizer(),
  ]);

module.exports.commonPrivateMiddleware = handler => middy(handler)
  .use([
    httpErrorHandler(),
  ]);
