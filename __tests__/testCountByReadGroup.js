/**
 * Created by acastillo on 11/25/16.
 */
var request = require('superagent');
const _config = require('./config/config-convict');

describe('Count by read group', function () {
    it.only('super should return the total of occurrences', function () {
        request
            .get('http://localhost:5000/api/v1.5/occurrence/count')
            .query({ isGeoreferenced: 'true', group: 'super' }) // query string
            .end(function(err, res){
               console.log(err);
                console.log(res);
            });
    });
    it('humboldt should not count the restricted occurrences', function () {
        request
            .get('http://localhost:5000/api/v1.5/occurrence/count')
            .query({ isGeoreferenced: 'true', group: 'humboldt' }) // query string
            .end(function(err, res){
                console.log(err);
                console.log(res);
            });
    });
    it('guess should return only the public occurrences', function () {
        request
            .get('http://localhost:5000/api/v1.5/occurrence/count')
            .query({ isGeoreferenced: 'true', group: 'guess' }) // query string
            .end(function(err, res){
                console.log(err);
                console.log(res);
            });
    });
});

