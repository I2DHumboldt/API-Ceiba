/**
 * Created by acastillo on 11/15/16.
 */
const _config = require('../config/config-convict');
const documentCreator = require('../documentCreator');

const folder = __dirname+'/../../data-test/resource/dwca-sanpedro_flora_2014'
describe('Create document', function () {
    it('should not return errors', function () {
        let nDocs = documentCreator(folder, 1);
        nDocs.should.eql(0);
    });
});

