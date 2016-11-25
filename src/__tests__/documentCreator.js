/**
 * Created by acastillo on 11/15/16.
 */
const documentCreator = require('../documentCreator');
const folder1 = __dirname+'/../../data-test/resource/dwca-sanpedro_flora_2014';
const folder2 = __dirname+'/../../data-test/resource/dwca-mateguadua_magnoliophyta_2014';
const folder3 = __dirname+'/../../data-test/resource/dwca-hemiptera_coleccion_iavh';


describe('Create document', function () {
    it('dwca-sanpedro_flora_2014 should not return errors', function () {
        var nDocs = documentCreator(folder1, 1);
        nDocs.should.eql(334);
    });
    /*it('dwca-mateguadua_magnoliophyta_2014 should not return errors', function () {
        var nDocs = documentCreator(folder2, 2);
        nDocs.should.eql(1410);
    });
    it('dwca-hemiptera_coleccion_iavh should not return errors', function () {
        var nDocs = documentCreator(folder3, 3);
        nDocs.should.eql(18779);
    });*/
});

