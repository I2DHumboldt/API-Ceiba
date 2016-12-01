'use strict'
/**
 * This function loads a Dwac resource from a directory path, convert it by using the mappers and save it
 * to the ElasticSearch database.
 * @returns the number of files exported to the database
 * Created by acastillo on 11/13/16.
 */
const fs = require('fs');
const dwacParser = require('./dwacParser');
const elasticsearch = require('elasticsearch');
const occurrenceMapper = require('./../config/mappers/occurrenceMapper.json');
const emlMapper = require('./../config/mappers/emlMapper.json');
const resourceMapper = require('./../config/mappers/resourceMapper.json');
const filterOccurrence = require('./filters/occurrence');
const filterOccResource = require('./filters/occResource');
const filterResource = require('./filters/resource');
const publisher = require('./../config/info/publisher.json');
const logger = require('./log');
const _config = require('../config/config-convict');
const Promise = require('promise');
const randomstring = require("randomstring");

function create(parameters, callback){
    try{
        let dwac = null;
        if(fs.existsSync(parameters.path+"dwca.zip")){
            dwac = dwacParser.loadFromZip(parameters.path+"dwca.zip", {
                'occurrence.txt':[{'key':'occurrence', 'mapper': occurrenceMapper}],
                'eml.xml':[{'key':'occResource', 'mapper': emlMapper},
                    {'key':'resource', 'mapper':resourceMapper}]}
            );
            return dwac.then(result => process(result, parameters, callback));
        } else {
            dwac = dwacParser.loadFromFolder(parameters.path, {
                'occurrence.txt':[{'key':'occurrence', 'mapper': occurrenceMapper}],
                'eml.xml':[{'key':'occResource', 'mapper': emlMapper},
                    {'key':'resource', 'mapper':resourceMapper}]}
            );
            process(dwac, parameters, callback);
        }
    }
    catch(generalError){
        logger.log('error', 'Error processing directory ' + parameters.path, generalError);
        callback("Error: General error", null);
    }
}

function process(dwac, parameters, callback) {
    try{
        let clientElastic = new elasticsearch.Client({
            host: _config.get('database.elasticSearch.url'),
            requestTimeout : Infinity
        });

        if(!dwac['occResource'] || !dwac['resource']) {
            callback("Error: Could not load the resource file", null);
        } else {
            let occResource = filterOccResource(dwac['occResource']);
            let collection = occResource.collection;
            delete occResource.collection;
            let occurrence = dwac['occurrence'];
            let resource = filterResource(dwac['resource']);
            let rsID = parameters.resourceID;
            occResource.id = rsID;
            resource.id = rsID;

            //Add the missing fields and transform fields
            let sourcefileid = '';
            let rgpId = occResource['gbif_package_id'];
            if(rgpId) {
                let lastIndexOf = rgpId.lastIndexOf('/');
                if(lastIndexOf >= 0) {
                    sourcefileid = rgpId.substring(0,lastIndexOf);
                }
            }
            else{
                logger.log('warn', 'Could not determine the sourcefileid for ' + parameters.path + ' ...I\'ll invent one');
                occResource['gbif_package_id'] = randomstring.generate();;
                resource['gbif_package_id'] = occResource['gbif_package_id'];
                sourcefileid = occResource['gbif_package_id'];
            }

            //Save the resource information
            if(resource) {
                clientElastic.create({
                    index: _config.get('database.elasticSearch.index'),
                    type: 'resource',
                    method: 'post',
                    id: rsID,
                    body: resource
                }, (result, reject) => {
                    logger.log('info', 'resource saved ' + parameters.path);

                } );
                if(occurrence) {
                    //Save the occurrences
                    createBulk(occurrence, collection, occResource, publisher, rsID, sourcefileid, callback, 10000, 0, clientElastic);

                }
                else{
                    //No occurrences to save
                    callback("No occurrences found!", 0);
                }
            }
            else{
                //No resources to save
                callback('No resouces found!', 0);
            }

        }
    }
    catch(error) {
        logger.log('error', 'at function process ' + parameters.path, error);
        callback(error, null);
    }
}

function createBulk(occurrence, collection, occResource, publisher, rsID, sourcefileid, callback, size, current, clientElastic){
    let next = Math.min(current + size, occurrence.length);
    let promises = [];
    for (let index = current; index < next; index++) {
        let doc = occurrence[index];
        if (doc && doc.dwca_id) {
            doc = filterOccurrence(doc);
            if(doc) {
                doc['sourcefileid'] = sourcefileid;
                doc['provider'] = publisher;
                doc['resource'] = occResource;
                Object.assign(doc.collection, collection);
                promises.push(clientElastic.create({
                    index: _config.get('database.elasticSearch.index'),
                    type: 'occurrence',
                    id: rsID + '_' + index,
                    body: doc
                }));
            }
        }
    }
    Promise.all(promises).then(values => {
        if(next < occurrence.length)
            createBulk(occurrence, collection, publisher, occResource, rsID, sourcefileid, callback, size, next, clientElastic);
        else
            callback(null, occurrence.length);
    }, reason => {
        if(next < occurrence.length)
            createBulk(occurrence, collection, publisher, occResource, rsID, sourcefileid, callback, size, next, clientElastic);
        else
            callback("Fail bulk " + reason, null);
    });

}

module.exports = create;

