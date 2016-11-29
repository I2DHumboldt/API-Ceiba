/**
 * Created by acastillo on 11/15/16.
 */
const documentCreator = require('../documentCreator');
const folder1 = __dirname+'/../../data-test/resource/dwca-sanpedro_flora_2014';
const folder2 = __dirname+'/../../data-test/resource/dwca-mateguadua_magnoliophyta_2014';
const folder3 = __dirname+'/../../data-test/resource/dwca-hemiptera_coleccion_iavh';

describe('Create document', function () {
    it('dwca-sanpedro_flora_2014 should not return errors', function (done) {
        this.timeout(Infinity);
        documentCreator({path: folder1, resourceID: 1}, function(err, resp) {
            if(err) {
                done("error");
            }
            if(resp) {
                resp.length.should.eql(335);
                done();
            }
        });
    });
    it('dwca-mateguadua_magnoliophyta_2014 should not return errors', function (done) {
        this.timeout(Infinity);
        documentCreator({path: folder2, resourceID: 2}, function(err, resp) {
            if(err) {
                done("error");
            }
            if(resp) {
                resp.length.should.eql(1077);
                done();
            }
        });
    });
    it('dwca-hemiptera_coleccion_iavh should not return errors', function (done) {
        this.timeout(Infinity);

        documentCreator({path: folder3, resourceID: 3}, function(err, resp) {
            if(err) {
                done("error");
            }
            if(resp) {
                resp.length.should.eql(17370);
                done();
            }
        });

    });
});

