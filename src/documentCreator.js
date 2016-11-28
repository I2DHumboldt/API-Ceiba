'use strict'
/**
 * This function loads a Dwac resource from a directory path, convert it by using the mappers and save it
 * to the ElasticSearch database.
 * @returns the number of files exported to the database
 * Created by acastillo on 11/13/16.
 */
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
        let clientElastic = new elasticsearch.Client({
            host: _config.get('database.elasticSearch.url'),
            requestTimeout : Infinity
        });

        let dwac = dwacParser.loadFromFolder(parameters.path, {
            'occurrence.txt':[{'key':'occurrence', 'mapper': occurrenceMapper}],
            'eml.xml':[{'key':'occResource', 'mapper': emlMapper},
                {'key':'resource', 'mapper':resourceMapper}]}
        );

        if(!dwac['occResource'] || !dwac['resource']) {
            callback("Error: Could not load the resource file", null);
            return 0;
        }

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
            rgpId = occResource['gbif_package_id'];
        }

        //Save the resource information
        let promises = [];
        if(resource) {
            promises.push(clientElastic.create({
                index: _config.get('database.elasticSearch.index'),
                type: 'resource',
                method: 'post',
                id: rsID,
                body: resource
            }));
            if(occurrence) {
                //Save the occurrences
                for (let index = 0; index < occurrence.length; index++) {
                    let doc = occurrence[index];
                    if (doc) {
                        doc = filterOccurrence(doc);
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
        }

        Promise.all(promises).then(values =>{
            callback(null, values);
        }, reason => {
            callback(reason, null);
        });

        if(occurrence && occurrence.length)
            return occurrence.length;
        else
            return 0;
    }
    catch(generalError){
        logger.log('error', 'Error processing directory ' + parameters.path, generalError);
        callback("Error: General error", null);
        return 0;
    }
}

module.exports = create;

