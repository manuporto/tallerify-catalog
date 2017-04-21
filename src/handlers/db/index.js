const artist = require('./artistHandler');
const track = require('./trackHandler');

const dbHandler = {
  artist,
	track
};
module.exports = dbHandler;