'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fixDate = require("../util/fixDate");

module.exports = function(resource){
    resource["resource_publication_date"] = fixDate(resource["resource_publication_date"]);

    let rai = resource["resource_alternate_identifier"];
    if(rai) {
        for(let i = 0; i < rai.length; i++ ) {
            //Omgggg this is cumbersome and perhaps not enough general!!!
            let indexOf = rai[i].indexOf("?r=");
            if(indexOf >= 0) {
                resource["resource_name"] = rai[i].substring(indexOf+3);
                break;
            }
        }
    }
    return resource;
}