const db = require('./../handlers/db/index');
const tables = require('../database/tableNames');
const respond = require('./../handlers/response');

const artistExpectedBodySchema = {
  type: 'object',
  properties: {
    name: {
      required: true,
      type: 'string',
    },
    description: {
      required: true,
      type: 'string',
    },
    genres: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
    images: {
      required: true,
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

const getArtists = (req, res) => {
  db.general.findAllEntries(tables.artists)
    .then(artists => respond.successfulArtistsFetch(artists, res))
    .catch(error => respond.internalServerError(error, res));
};

const newArtist = (req, res) => {
  respond.validateRequestBody(req.body, artistExpectedBodySchema)
    .then(() => {
      db.artist.createNewArtistEntry(req.body)
        .then(artist => respond.successfulArtistCreation(artist, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const getArtist = (req, res) => {
  db.general.findEntryWithId(tables.artists, req.params.id)
    .then((artist) => {
      if (!respond.entryExists(req.params.id, artist, res)) return;
      db.artist.getAlbumsInfo(req.params.id)
        .then((albums) => {
          const finalArtist = Object.assign({}, artist, { albums: albums });
          respond.successfulArtistFetch(finalArtist, res);
        })
        .catch(error => respond.internalServerError(error, res));
    });
};

const updateArtist = (req, res) => {
  respond.validateRequestBody(req.body, artistExpectedBodySchema)
    .then(() => {
      db.general.findEntryWithId(tables.artists, req.params.id)
        .then((artist) => {
          if (!respond.entryExists(req.params.id, artist, res)) return;
          db.artist.updateArtistEntry(req.body, req.params.id)
            .then(updatedArtist => respond.successfulArtistUpdate(updatedArtist, res))
            .catch(error => respond.internalServerError(error, res));
        })
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.invalidRequestBodyError(error, res));
};

const deleteArtist = (req, res) => {
  db.general.findEntryWithId(tables.artists, req.params.id)
    .then((artist) => {
      if (!respond.entryExists(req.params.id, artist, res)) return;
      db.artist.deleteArtist(req.params.id)
        .then(() => respond.successfulArtistDeletion(res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const getFavoriteArtists = (req, res) => {
  db.artist.findUserFavorites(req.user.id)
    .then(artists => respond.successfulArtistsFetch(artists, res))
    .catch(error => respond.internalServerError(error, res));
};

const artistUnfollow = (req, res) => {
  db.general.findEntryWithId(tables.artists, req.params.id)
    .then((artist) => {
      if (!respond.entryExists(req.params.id, artist, res)) return;
      db.artist.unfollow(req.user.id, req.params.id)
        .then(() => respond.successfulArtistUnfollow(artist, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const artistFollow = (req, res) => {
  db.general.findEntryWithId(tables.artists, req.params.id)
    .then((artist) => {
      if (!respond.entryExists(req.params.id, artist, res)) return;
      db.artist.follow(req.user.id, req.params.id)
        .then(() => respond.successfulArtistFollow(artist, res))
        .catch(error => respond.internalServerError(error, res));
    })
    .catch(error => respond.internalServerError(error, res));
};

const getTracks = (req, res) => {

};


module.exports = {
  getArtists,
  newArtist,
  getArtist,
  updateArtist,
  deleteArtist,
  getFavoriteArtists,
  artistUnfollow,
  artistFollow,
  getTracks,
};
