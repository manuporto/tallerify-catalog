// recommendations
const g = require('ger');

const esm = new g.MemESM();
const ger = new g.GER(esm);
ger.initialize_namespace('tracks');
ger.initialize_namespace('artists');

module.exports = ger;
