// recommendations
const g = require('ger');
const esm = new g.MemESM();
const ger = new g.GER(esm);
ger.initialize_namespace('tracks');
ger.initialize_namespace('artists');
// ger.events([
//   {
//     namespace: 'tracks',
//     person: 'bob',
//     action: 'likes',
//     thing: '5',
//     expires_at: '2020-06-06'
//   },
//   {
//     namespace: 'tracks',
//     person: 'bob',
//     action: 'likes',
//     thing: '1',
//     expires_at: '2020-06-06'
//   },
// ]);

module.exports = ger;