/**
 * Created by acastillo on 11/25/16.
 */
const request = require('superagent');
const should = require('should');

describe('Count by read group', function () {
    it('super should return the total of occurrences', function (done) {
        request
            .get('http://localhost:9200/sibdataportal/_count?q=resource.group:super')
            .end(function(err, res){
                should.equal(err, null);
                res.body.count.should.eql(18779);
                var result = res.body;
                console.
                done();
            });
    });
    it('humboldt should not count the restricted occurrences', function (done) {
        request
            .get('http://localhost:9200/sibdataportal/_search?q=resource.group:humboldt')
            .end(function(err, res){
                should.equal(err, null);
                res.body.count.should.eql(1410);
                done();
            });
    });
    it('guess should return only the public occurrences', function (done) {
        request
            .get('http://localhost:9200/sibdataportal/_count?q=resource.group:guess')
            .end(function(err, res){
                should.equal(err, null);
                res.body.count.should.eql(334);
                done();
            });
    });
});

