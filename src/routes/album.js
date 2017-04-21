const logger = require('../utils/logger');

const postAlbum = (req, res) => {
  /*
  logger.info(`Post /albums with query ${JSON.stringify(req.body, null, 4)}`);

  models.albums.create({
    name: req.body.name,
    release_date: req.body.release_tdate,
    genres: req.body.genres,
    images: req.body.images,
  }).then(() => {
    logger.debug(`[Post /albums]Finding artist: ${req.body.artists[0]}`);
    models.artists.findAll(
      {
        where: {
          name: req.body.artists[0],
        },
      }).then((selectedArtist) => {
        logger.debug(`[Post /albums] Found artist id: ${selectedArtist}`);
        res.status(200).json(selectedArtist);
      });
    // It hangs here
    // Promise.all(req.body.artists.map(artist => {
    //   winston.log('debug', `Finding artist: ${artist}`);
    //   models.artists.findAll(
    //     {
    //       where: {
    //         name: artist
    //       }
    //     }).then((selectedArtist => {
    //     winston.log('debug', `Artist id: ${selectedArtist}`);
    //     }));
    // }));
    // models.albums.find({
    //   where: {
    //     id : album.id
    //   },
    //   include: [{
    //     model: models.artists
    //   }]
    // }).then(function(result) {
    //   winston.log('info', `New album created: ${album}`);
    //   res.status(200).json(result);
    // });

  });*/
};

module.exports = { postAlbum };
