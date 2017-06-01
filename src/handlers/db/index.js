const general = require('./generalHandler');
const artist = require('./artistHandler');
const track = require('./trackHandler');
const user = require('./userHandler');
const album = require('./albumHandler');
const playlist = require('./playlistHandler');
const artistTrack = require('./artistTrackHandler');
const albumArtist = require('./albumArtistHandler');

const dbHandler = {
  general,
  artist,
  album,
  track,
  user,
  playlist,
  artistTrack,
  albumArtist,
};
module.exports = dbHandler;
