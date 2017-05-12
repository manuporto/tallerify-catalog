const general = require('./generalHandler');
const artist = require('./artistHandler');
const track = require('./trackHandler');
const user = require('./userHandler');
const artistTrack = require('./artistTrackHandler');

const dbHandler = {
  general,
  artist,
  track,
  user,
  artistTrack,
};
module.exports = dbHandler;
