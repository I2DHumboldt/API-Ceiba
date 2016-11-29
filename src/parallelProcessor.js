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
if( !resourcesFolder.endsWith("/") )
    resourcesFolder += "/";
var files = fs.readdirSync(resourcesFolder);
var index = 0;
files.forEach(function(f) {
    //For each folder in the resources folder proceed to importation
    if(fs.lstatSync(resourcesFolder+f).isDirectory()) {
        logger.info("Importing from: "+resourcesFolder+f+"/");
        documentCreator({path: resourcesFolder+f+"/", resourceID: index++}, function(err, resp){
            if(err) {
                logger.log("error", "Error processing " +resourcesFolder+f+"/", err);
            }
            if(resp) {
                logger.info("Dwac processed correctly "+ resourcesFolder+f+"/");
                logger.info("occurrences imported: "+resp.length);

            }
        });
    }
});

function processResource(list) {

}

