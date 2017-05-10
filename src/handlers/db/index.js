const general = require('./generalHandler');
const artist = require('./artistHandler');
const track = require('./trackHandler');
const user = require('./userHandler');

const dbHandler = {
  general,
  artist,
  track,
  user,
};
module.exports = dbHandler;
