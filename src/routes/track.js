const logger = require('../utils/logger');
const db = require('../database/');
const tables = require('../database/tableNames');
const tracksTable = require('./constants.json')["TRACKS_TABLE_NAME"]

function postTrack(req, res) {
	db(tables.tracks).returning('*').insert({
		name: req.body.name,
		duration: req.body.duration
	}).then(track => {
		let count = 0;
		let currentArtist = 0;
		const artistsLenght = req.body.artists.length;
		while(count < artistsLenght) {
			if (currentArtist < artistsLenght) {
				db(tables.artists).
					where({name: req.body.artists[currentArtist]}).
					select('id').
					then(id => {
						logger.info(`Artist ID: ${JSON.stringify(id, null, 4)}`);
						logger.info(`Track ID: ${JSON.stringify(track, null, 4)}`);
						db(tables.artists_tracks).insert({
							track_id: track[0].id,
							artist_id: id[0].id
						}).then(() => {
							count++;
						})
				});
			}
		}
		res.status(201).json(track);
	})
}

module.exports = { postTrack };
