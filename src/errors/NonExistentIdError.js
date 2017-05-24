const createError = require('node-custom-errors').create;
const NonExistentIdError = createError('NonExistentIdError');

module.exports = NonExistentIdError;
