'use strict'
/**
 * This function loads a Dwac resource from a directory path, convert it by using the mappers and save it
 * to the ElasticSearch database.
 * @returns the number of files exported to the database
 * Created by acastillo on 11/13/16.
 */
const dwacParser = require('./DwacParser');
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
            logger.log('error', 'Could not determine the sourcefileid for '+ parameters.path);
            return;
        }

        //Save the resource information
        let promises = [];
        promises.push(clientElastic.create({
            index: _config.get('database.elasticSearch.index'),
            type: 'resource',
            method: 'post',
            id: rsID,
            body: resource
        }));

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

        Promise.all(promises).then(values =>{
            callback(null, values);
        }, reason => {
            callback(reason, null);
        });

        return occurrence.length;
    }
    catch(generalError){
        logger.log('error', 'Error processing directory ' + parameters.path, generalError);
    }
}

module.exports = create;

