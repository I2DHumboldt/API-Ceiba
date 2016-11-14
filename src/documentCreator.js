'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const dwacParser = require("./dwacParser");
const _ = require('lodash');
const async = require('async');
const elasticsearch = require('elasticsearch');
const occurrenceMapper = require("./../config/occurrenceMapper.json");
const emlMapper = require("./../config/emlMapper.json");
const resourceMapper = require("./../config/resourceMapper.json");
const filterOccurrence = require("./filters/occurrence");
const filterOccResource = require("./filters/occResource");
const filterResource = require("./filters/resource");

const clientElastic = new elasticsearch.Client({
    host: process.env.ESDBHOST
});

let dwac = dwacParser.loadFromFolder(__dirname+"/../data-test/resource/dwca-sanpedro_flora_2014",
    {"occurrence.txt":[{"key":"occurrence", "mapper": occurrenceMapper}],
    "eml.xml":[{"key":"occResource", "mapper": emlMapper},
                {"key":"resource", "mapper":resourceMapper}]}
);
let occResource = filterOccResource(dwac["occResource"]);
let occurrence = dwac["occurrence"];
let resource = filterResource(dwac["resource"]);

//Add the missing fields and transform fields
var sourcefileid = "";
let rgpId = occResource["resource_gbif_package_id"];
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
occurrence.forEach(function(doc) {
    doc = filterOccurrence(doc);
    doc["sourcefileid"] = sourcefileid;
    let occurrenceDoc = Object.assign(occResource, doc);
    clientElastic.create({
        index: 'sibdataportal',
        type: 'occurrence',
        method: 'post',
        id: doc["occurrenceid"],
        body: occurrenceDoc
    }, function (error, response) {
        if(error)
            console.log(error);
        else
            console.log(response);

    });
});
