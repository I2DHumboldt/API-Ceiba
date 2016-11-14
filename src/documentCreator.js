'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const dwacParser = require("./dwacParser");
var _ = require('lodash');
var async = require('async');
var elasticsearch = require('elasticsearch');

const clientElastic = new elasticsearch.Client({
    host: process.env.ESDBHOST
});


let dwac = dwacParser.loadFromFolder(__dirname+"/../data-test/resource/dwca-sanpedro_flora_2014");
let meta = dwac["eml.xml"];
let occurrence = dwac["occurrence.txt"];
console.log("length ",occurrence.length);

//Add the missing fields and transform fields
//@TODO Check this with the supervisor
//Add the missing fields
let rai = meta["resource_alternate_identifier"];
if(rai) {
    for(let i = 0; i < rai.length; i++ ) {
        //Omgggg this is cumbersome and perhaps not enough general!!!
        let indexOf = rai[i].indexOf("?r=");
        if(indexOf >= 0) {
            meta["resource_name"] = rai[i].substring(indexOf+3);
            break;
        }
    }
}
var sourcefileid = "";
let rgpId = meta["resource_gbif_package_id"];
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
    doc["sourcefileid"] = sourcefileid;
    let occurrenceDoc = Object.assign(meta, doc);
    clientElastic.create({
        index: 'sibdataportal',
        type: 'occurrence',
        body: occurrenceDoc
    });
});
