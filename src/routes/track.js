const logger = require('../utils/logger');
const db = require('../database/');
const tables = require('../database/tableNames');

function postTrack(req, res) {
	db(tables.tracks).returning('*').insert({
		name: req.body.name,
		duration: req.body.duration
	}).then(track => {
		db(tables.artists).
			whereIn('name', req.body.artists).select('id').then(ids => {
				const trackId = track[0].id;
				let rowValues = [];
				// ex ids = {"id": 1, "id": 6}
				ids.forEach(id => {
					rowValues.push(
						{
							track_id: trackId,
							artist_id: id.id
						}
					);
				});
				db(tables.artists_tracks).insert(rowValues).then(() => {
					res.status(201).json(track);
				})
		});
	})
}

module.exports = { postTrack };
