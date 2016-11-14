'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fixDate = require("../util/fixDate");

module.exports = function(resource){
    //Add the missing fields and transform fields
    //@TODO Check this with the supervisor
    resource["publication_date"] = fixDate(resource["publication_date"]);

    let rai = resource["alternate_identifier"];
    if(rai) {
        for(let i = 0; i < rai.length; i++ ) {
            //Omgggg this is cumbersome and perhaps not enough general!!!
            let indexOf = rai[i].indexOf("?r=");
            if(indexOf >= 0) {
                resource["name"] = rai[i].substring(indexOf+3);
                break;
            }
        }
    }

    resource["contact"] = [];
    if(resource["resource_creator"]) {
        resource["resource_creator"].rol = "resource_creator"
        resource["contact"].push(resource["resource_creator"]);
        delete resource["resource_creator"];
    }
    if(resource["metadata_provider"]) {
        resource["metadata_provider"].rol = "metadata_provider"
        resource["contact"].push(resource["metadata_provider"]);
        delete resource["metadata_provider"];
    }
    if(resource["agent"]) {
        resource["agent"].rol = "agent"
        resource["contact"].push(resource["agent"]);
        delete resource["agent"];
    }
    if(resource["resource_contact"]) {
        resource["resource_contact"].rol = "contact"
        resource["contact"].push(resource["resource_contact"]);
        delete resource["resource_contact"];
    }
}


