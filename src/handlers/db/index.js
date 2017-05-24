const general = require('./generalHandler');
const artist = require('./artistHandler');
const track = require('./trackHandler');
const user = require('./userHandler');
const album = require('./albumHandler');
const artistTrack = require('./artistTrackHandler');

const dbHandler = {
  general,
  artist,
  album,
  track,
  user,
  artistTrack,
};
module.exports = dbHandler;
