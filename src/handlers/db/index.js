const general = require('./generalHandler');
const artist = require('./artistHandler');
const track = require('./trackHandler');
const album = require('./albumHandler');
const artistTrack = require('./artistTrackHandler');

const dbHandler = {
  general,
  artist,
  album,
  track,
  artistTrack,
};
module.exports = dbHandler;
