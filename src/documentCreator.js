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


function create(folderToProcess, resourceID){
    try{
        const clientElastic = new elasticsearch.Client({
            host: _config.get('database.elasticSearch.url'),
            requestTimeout : Infinity
        });

        let dwac = dwacParser.loadFromFolder(folderToProcess, {
            'occurrence.txt':[{'key':'occurrence', 'mapper': occurrenceMapper}],
            'eml.xml':[{'key':'occResource', 'mapper': emlMapper},
                {'key':'resource', 'mapper':resourceMapper}]}
        );
        let occResource = filterOccResource(dwac['occResource']);
        let collection = occResource.collection;
        delete occResource.collection;
        let occurrence = dwac['occurrence'];
        let resource = filterResource(dwac['resource']);

        occResource.id = resourceID;
        resource.id = resourceID;


        //Add the missing fields and transform fields
        var sourcefileid = '';
        let rgpId = occResource['gbif_package_id'];
        if(rgpId) {
            let lastIndexOf = rgpId.lastIndexOf('/');
            if(lastIndexOf >= 0) {
                sourcefileid = rgpId.substring(0,lastIndexOf);
            }
        }
        else{
            logger.log("error", 'Could not determine the sourcefileid for '+folderToProcess);
            return;
        }

        /*for(var k = 15481; k < 15482; k ++) {
            //if(!filterOccurrence(occurrence[k]).eventdate_start)
                console.log(k,filterOccurrence(occurrence[k]));

            //console.log(filterOccurrence(occurrence[k].eventdate_start), filterOccurrence(occurrence[k].eventdate_end));
        }*/
        //Save the resource information
        clientElastic.create({
            index: _config.get('database.elasticSearch.index'),
            type: 'resource',
            method: 'post',
            id: sourcefileid,
            body: resource
        }, function (error, response) {
            //@TODO Sent to logger
            if(error) {
                logger.log("error", 'Error saving resource', error);
            }
            else {
                logger.log("info", response);
            }
        });


        //Save the occurrences
        let occurrenceKey = 0;
        var documentCount = 0;
        occurrence.forEach(function(doc) {
            documentCount++;
            let documentCountLet = documentCount;
            if(doc){
                doc = filterOccurrence(doc);
                doc['sourcefileid'] = sourcefileid;
                doc['provider'] = publisher;
                doc['resource'] = occResource;
                Object.assign(doc.collection, collection);
                clientElastic.create({
                    index: _config.get('database.elasticSearch.index'),
                    type: 'occurrence',
                    id: sourcefileid + '_' + occurrenceKey++,
                    body: doc
                }, function (error, response) {
                    //@TODO Sent to logger
                    if(error) {
                        logger.log("error", 'Error saving occurrence '+documentCountLet, error);
                    }
                    else{
                        logger.log("info", sourcefileid+" "+sourcefileid+" "+documentCountLet);
                    }
                });
            }
        });

        return occurrence.length;
    }
    catch(generalError){
        logger.log("error", 'Error processing directory '+folderToProcess,"Step: "+documentCount, generalError);
    }

    return 0;
}

module.exports = create;

