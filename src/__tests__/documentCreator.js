/**
 * Created by acastillo on 11/15/16.
 */
const _config = require('../../config/config.json');
const documentCreator = require('../documentCreator');

const folder = __dirname+'/../../data-test/resource/dwca-sanpedro_flora_2014'

let nDocs = documentCreator(folder, 1, _config.database.elasticSearch);

console.log(nDocs+" imported");


