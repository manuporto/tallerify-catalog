const general = require('./generalHandler');
const artist = require('./artistHandler');
const track = require('./trackHandler');

const dbHandler = {
  general,
  artist,
	track,
};
module.exports = dbHandler;
