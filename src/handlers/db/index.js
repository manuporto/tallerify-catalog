const general = require('./generalHandler');
const artist = require('./artistHandler');
const track = require('./trackHandler');
const artistTrack = require('./artistTrackHandler');

const dbHandler = {
  general,
  artist,
  track,
  artistTrack
};
module.exports = dbHandler;
