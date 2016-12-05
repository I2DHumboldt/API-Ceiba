'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fixDate = require("../util/fixDate");

function filterOcResource(resource){
    resource["publication_date"] = fixDate(resource["publication_date"]);
    //Add the access group for the resource based on the intelectual rights
    resource['group'] = 'super';// By default is only accessible for the super users
    let intellectualRights = resource['intellectual_rights'];
    if(intellectualRights) {
        intellectualRights = intellectualRights.toLowerCase().replace(/ /g,'');
        if(intellectualRights.indexOf('libreanivelinterno') >= 0) {
            resource['group'] = ['super', 'humboldt'];
            if(intellectualRights.indexOf('externo') >= 0) {
                resource['group'] = ['super', 'humboldt', 'guess'];
            }
        }
    }

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
    return resource;
}

module.exports = filterOcResource;