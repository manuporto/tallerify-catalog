const logger = require('../utils/logger');
const models = require('../models/index');

postTrack = (req, res) => {
  logger.info(`Post /tracks with query ${JSON.stringify(req.body, null, 4)}`);
  models.tracks.create({
    albumId: req.body.albumId,
    artists: req.body.artists,
    name: req.body.name,
  }).then((track) => {
    res.status(200).json(track);
  });
};

module.exports = { postTrack };
