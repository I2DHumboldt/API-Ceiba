'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fs = require('fs');
const documentCreator = require('./documentCreator');
const _config = require('../config/config-convict');
const logger = require('./log');

/**
 * This function reads all the directories in the _config.source path and import
 * each in the ElasticSearch (_config.database.elasticSearch) database.
 */

var resourcesFolder = _config.get('source');
if( !resourcesFolder.endsWith('/') )
    resourcesFolder += '/';
var files = fs.readdirSync(resourcesFolder);
var resources = files.map((value, index) => {
    if(fs.lstatSync(resourcesFolder + value).isDirectory()) {
        return {resourceID: index, path: resourcesFolder+value +'/'}
    }
});
resources = resources.filter(value => typeof value !== 'undefined');

processResource(resources);

function processResource(list) {
    if(list && list.length >=1 ) {
        var resource = list.splice(0,1)[0];
        logger.info('Importing from: ' + resource.path);
        documentCreator(resource, function(err, resp){
            if(err) {
                logger.log('error', 'Error processing ' + resource.path, err);
            }
            if(resp) {
                logger.info('Dwac processed correctly ' + resource.path);
                logger.info('documents imported: '+resp.length);

            }
            processResource(list);
        });
    }
}
