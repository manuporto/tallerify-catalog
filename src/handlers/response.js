const constants = require('./../routes/constants.json');
const logger = require('../utils/logger');
const amanda = require('amanda');

const jsonSchemaValidator = amanda('json');

const internalServerError = (reason, response) => {
  const message = `Unexpected error: ${reason}`;
  logger.warn(message);
  return response.status(500).json({ code: 500, message });
};

const unauthorizedError = (reason, response) => {
  const message = `Unauthorized: ${reason}`;
  logger.warn(message);
  response.status(401).json({ code: 401, message });
};

const nonExistentId = (message, response) => {
  logger.warn(message);
  response.status(400).json({ code: 400, message });
};

const validateRequestBody = (body, schema) => {
  logger.info(`Validating request "${JSON.stringify(body, null, 4)}"`);
  return new Promise((resolve, reject) => {
    jsonSchemaValidator.validate(body, schema, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const invalidRequestBodyError = (reasons, response) => {
  const message = `Request body is invalid: ${reasons[0].message}`;
  logger.warn(message);
  return response.status(400).json({ code: 400, message });
};

const entryExists = (id, entry, response) => {
  logger.info(`Queried entry: ${JSON.stringify(entry, null, 4)}`);
  if (!entry) {
    logger.warn(`No entry with id ${id}`);
    response.status(404).json({ code: 404, message: `No entry with id ${id}` });
    return false;
  }
  return true;
};

/* Users */

const formatUserShortJson = user => ({
  id: user.id,
  userName: user.userName,
  href: user.href,
  images: user.images,
});

const formatUserContacts = contacts => (contacts[0] === null) ? [] : contacts.map(formatUserShortJson);

const formatUserJson = user => ({
  userName: user.userName,
  password: user.password,
  fb: {
    userId: user.facebookUserId,
    authToken: user.facebookAuthToken,
  },
  firstName: user.firstName,
  lastName: user.lastName,
  country: user.country,
  email: user.email,
  birthdate: user.birthdate,
  images: user.images,
  href: user.href,
  contacts: formatUserContacts(user.contacts),
});

const formatGetUserJson = user => ({
  id: user.id,
  userName: user.userName,
  password: user.password,
  fb: {
    userId: user.facebookUserId,
    authToken: user.facebookAuthToken,
  },
  firstName: user.firstName,
  lastName: user.lastName,
  country: user.country,
  email: user.email,
  birthdate: user.birthdate,
  images: user.images,
  href: user.href,
  contacts: formatUserContacts(user.contacts),
});

const successfulUsersFetch = (users, response) => {
  logger.info('Successful users fetch');
  return response.status(200).json({
    metadata: {
      count: users.length,
      version: constants.API_VERSION,
    },
    users: users.map(formatGetUserJson),
  });
};

const successfulUserFetch = (user, response) => {
  logger.info('Successful user fetch');
  response.status(200).json({
    metadata: {
      count: 1,
      version: constants.API_VERSION,
    },
    user: formatGetUserJson(user),
  });
};

const successfulUserCreation = (user, response) => {
  logger.info('Successful user creation');
  response.status(201).json(formatUserJson(user));
};

const successfulUserUpdate = (user, response) => {
  logger.info('Successful user update');
  response.status(200).json(formatUserJson(user));
};

const successfulUserDeletion = (response) => {
  logger.info('Successful user deletion');
  response.sendStatus(204);
};

const successfulUserContactsFetch = (contacts, response) => {
  logger.info('Successful contacts fetch');
  response.status(200).json({
    metadata: {
      count: contacts.length,
      version: constants.API_VERSION,
    },
    contacts: formatUserContacts(contacts),
  });
};

const successfulContactAddition = (response) => {
  logger.info('Successful contact addition');
  response.sendStatus(201);
};

const successfulContactDeletion = (response) => {
  logger.info('Successful contact deletion');
  response.sendStatus(204);
};

/* Admins */

const successfulAdminsFetch = (admins, response) => {
  logger.info('Successful admins fetch');
  return response.status(200).json({
    metadata: {
      count: admins.length,
      version: constants.API_VERSION,
    },
    admins,
  });
};

const successfulAdminCreation = (admin, response) => {
  logger.info('Successful admin creation');
  response.status(201).json(admin[0]);
};

const successfulAdminDeletion = (response) => {
  logger.info('Successful admin deletion');
  response.sendStatus(204);
};

/* Tokens */

const nonexistentCredentials = (response) => {
  const message = 'No entry with such credentials';
  logger.warn(message);
  response.status(400).json({ code: 400, message });
};

const inconsistentCredentials = (response) => {
  const message = 'There is more than one entry with those credentials';
  logger.warn(message);
  response.status(500).json({ code: 500, message });
};

const successfulTokenGeneration = (result, response) => {
  logger.info('Successful token generation');
  response.status(201).json(result);
};

const successfulUserTokenGeneration = (user, token, response) => {
  const result = { token };
  successfulTokenGeneration(result, response);
};

const successfulAdminTokenGeneration = (admin, token, response) => {
  const result = Object.assign(
    {},
    {
      token,
      admin: {
        id: admin.id,
        userName: admin.userName,
      },
    });
  successfulTokenGeneration(result, response);
};

/* Artists */

const formatArtistShortJson = artist => ({
  id: artist.id,
  name: artist.name,
  href: artist.href,
  images: artist.images,
});

const successfulArtistsFetch = (artists, res) => {
  logger.info('Successful artists fetch');
  return res.status(200).json({
    metadata: {
      count: artists.length,
      version: constants.API_VERSION,
    },
    artists,
  });
};

const successfulArtistCreation = (artist, res) => {
  logger.info('Successful artist creation');
  res.status(201).json(artist[0]);
};

/* Albums */

const formatAlbumShortJson = (album) => {
  if (album) {
    return {
      id: album.id,
      name: album.name,
      href: album.href,
      images: album.images,
    };
  }
};

const formatAlbumJson = album => ({
  id: album.id,
  name: album.name,
  release_date: album.release_date,
  href: album.href,
  popularity: album.popularity,
  artists: album.artists, // TODO album.artists.map(artist => formatArtistShortJson(artist)),
  tracks: album.tracks, // TODO album.tracks.map(track => formatTrackShortJson(track)),
  genres: album.genres,
  images: album.images,
});

const successfulAlbumsFetch = (albums, response) => {
  logger.info(`Successful albums fetch ${JSON.stringify(albums, null, 4)}`);
  return response.status(200).json({
    metadata: {
      count: albums.length,
      version: constants.API_VERSION,
    },
    albums: albums.map(formatAlbumJson),
  });
};

const successfulAlbumCreation = (album, response) => {
  logger.info(`Successful album creation ${JSON.stringify(album, null, 4)}`);
  response.status(201).json(formatAlbumJson(album[0]));
};

const successfulAlbumFetch = (album, response) => {
  logger.info('Successful album fetch');
  response.status(200).json({
    metadata: {
      count: 1,
      version: constants.API_VERSION,
    },
    album: formatAlbumJson(album),
  });
};

const successfulAlbumUpdate = (album, response) => {
  logger.info('Successful album update');
  response.status(200).json(formatAlbumJson(album[0]));
};

const successfulAlbumDeletion = (response) => {
  logger.info('Successful album deletion');
  response.sendStatus(204);
};

const invalidTrackDeletionFromAlbum = (trackId, albumId, response) => {
  const message = `Track (id: ${trackId}) does not belong to album (id: ${albumId})`;
  logger.info(message);
  response.status(400).json({ code: 400, message });
};

const successfulTrackDeletionFromAlbum = (trackId, albumId, response) => {
  logger.info(`Successful track (id: ${trackId}) deletion from album (id: ${albumId})`);
  response.sendStatus(204);
};

const successfulTrackAdditionToAlbum = (trackId, album, response) => {
  logger.info(`Track (id: ${trackId}) now belongs to album (id: ${album.id})`);
  response.status(200).json(formatAlbumJson(album));
};

/* Tracks */

const formatTrackShortJson = track => ({
  id: track.id,
  name: track.name,
  href: track.href,
  images: track.images,
});

const formatTrackJson = track => ({
  id: track.id,
  name: track.name,
  href: track.href,
  duration: track.duration,
  popularity: {
    rate: track.rating,
  },
  album: formatAlbumShortJson(track.album),
  artists: (track.hasOwnProperty('artists')) ?
    track.artists.map(artist => formatArtistShortJson(artist)) : [],
});

const successfulTracksFetch = (tracks, response) => {
  logger.info(`Successful tracks fetch ${JSON.stringify(tracks, null, 4)}`);
  return response.status(200).json({
    metadata: {
      count: tracks.length,
      version: constants.API_VERSION,
    },
    tracks: tracks.map(formatTrackJson),
  });
};

const successfulTrackCreation = (track, response) => {
  logger.info(`Successful track creation ${JSON.stringify(track, null, 4)}`);
  response.status(201).json(formatTrackJson(track[0]));
};

const successfulTrackFetch = (track, response) => {
  logger.info('Successful track fetch');
  response.status(200).json({
    metadata: {
      count: 1,
      version: constants.API_VERSION,
    },
    track: formatTrackJson(track),
  });
};

const successfulTrackUpdate = (track, response) => {
  logger.info('Successful track update');
  response.status(200).json(formatTrackJson(track[0]));
};

const successfulTrackDeletion = (response) => {
  logger.info('Successful track deletion');
  response.sendStatus(204);
};

const successfulTrackLike = (track, response) => {
  logger.info('Successful track like');
  response.status(201).json(formatTrackJson(track));
};

const successfulTrackDislike = (track, response) => {
  logger.info('Successful track dislike');
  response.status(204).json(formatTrackJson(track));
};

const successfulTrackPopularityCalculation = (rating, response) => {
  logger.info(`Successful track popularity calculation (rate: ${rating})`);
  response.status(200).json({
    metadata: {
      count: 1,
      version: constants.API_VERSION,
    },
    popularity: {
      rate: rating,
    },
  });
};

const successfulTrackRate = (rate, response) => {
  logger.info(`Successful track rate: ${rate}`);
  response.status(201).json({
    rate,
  });
};

module.exports = {
  internalServerError,
  unauthorizedError,
  nonExistentId,
  validateRequestBody,
  entryExists,
  invalidRequestBodyError,
  successfulUsersFetch,
  successfulUserFetch,
  successfulUserCreation,
  successfulUserUpdate,
  successfulUserDeletion,
  successfulUserContactsFetch,
  successfulContactAddition,
  successfulContactDeletion,
  successfulAdminsFetch,
  successfulAdminCreation,
  successfulAdminDeletion,
  nonexistentCredentials,
  inconsistentCredentials,
  successfulUserTokenGeneration,
  successfulAdminTokenGeneration,
  successfulArtistsFetch,
  successfulArtistCreation,
  successfulAlbumsFetch,
  successfulAlbumCreation,
  successfulAlbumFetch,
  successfulAlbumUpdate,
  successfulAlbumDeletion,
  invalidTrackDeletionFromAlbum,
  successfulTrackDeletionFromAlbum,
  successfulTrackAdditionToAlbum,
  successfulTracksFetch,
  successfulTrackCreation,
  successfulTrackFetch,
  successfulTrackUpdate,
  successfulTrackDeletion,
  successfulTrackLike,
  successfulTrackDislike,
  successfulTrackPopularityCalculation,
  successfulTrackRate,
};
