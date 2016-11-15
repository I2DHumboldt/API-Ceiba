'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const dwacParser = require("./dwacParser");
const _ = require('lodash');
const async = require('async');
const elasticsearch = require('elasticsearch');
const occurrenceMapper = require("./../config/mappers/occurrenceMapper.json");
const emlMapper = require("./../config/mappers/emlMapper.json");
const resourceMapper = require("./../config/mappers/resourceMapper.json");
const filterOccurrence = require("./filters/occurrence");
const filterOccResource = require("./filters/occResource");
const filterResource = require("./filters/resource");
const publisher = require("./../config/publisher.json");


const resourceID = 1;

const clientElastic = new elasticsearch.Client({
    host: process.env.ESDBHOST
});

let dwac = dwacParser.loadFromFolder(__dirname+"/../data-test/resource/dwca-sanpedro_flora_2014",
    {"occurrence.txt":[{"key":"occurrence", "mapper": occurrenceMapper}],
    "eml.xml":[{"key":"occResource", "mapper": emlMapper},
                {"key":"resource", "mapper":resourceMapper}]}
);
let occResource = filterOccResource(dwac["occResource"]);
let collection = occResource.collection;
delete occResource.collection;
let occurrence = dwac["occurrence"];
let resource = filterResource(dwac["resource"]);

occResource.id = resourceID;
resource.id = resourceID;

//Add the missing fields and transform fields
var sourcefileid = "";
let rgpId = occResource["gbif_package_id"];
if(rgpId) {
    let lastIndexOf = rgpId.lastIndexOf("/");
    if(lastIndexOf >= 0) {
        sourcefileid = rgpId.substring(0,lastIndexOf);
    }
}
else{
    console.log("Could not determine the sourcefileid");
    return;
}

clientElastic.create({
    index: 'sibdataportal',
    type: 'resource',
    method: 'post',
    id: sourcefileid,
    body: resource
}, function (error, response) {
    //@TODO Sent to logger
    if(error) {
        console.log("Saving resource: ", error);
    }
    else {
        //console.log(response);
    }
});

occurrence.forEach(function(doc) {
    if(doc){
        doc = filterOccurrence(doc);
        doc["sourcefileid"] = sourcefileid;
        doc["provider"] = publisher;
        doc["resource"] = occResource;
        Object.assign(doc.collection, collection);
        //let occurrenceDoc = Object.assign(occResource, publisher, doc);
        //console.log(occurrenceDoc)
        clientElastic.create({
            index: 'sibdataportal',
            type: 'occurrence',
            id: doc["occurrenceid"],
            body: doc
        }, function (error, response) {
            //@TODO Sent to logger
            if(error) {
                console.log("Saving occurrence: ", error);
            }
            else{
                //console.log(response);
            }
        });
    }
})
