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
    contactFilter(resource, "resource_creator",  "resource_creator");
    contactFilter(resource, "metadata_provider",  "metadata_provider");
    contactFilter(resource, "agent",  "agent");
    contactFilter(resource, "resource_contact",  "contact");

    return resource;
}

function contactFilter(resource, contact, rol) {
    var field = resource[contact];
    if(field) {
        field.rol = rol;
        field.publisher_fkey = "05b001e7-f903-4925-a679-205329408d01";
        resource["contact"].push(field);
        delete resource[contact];

/*        field.name = field["individualName"]["givenName"]+" "+field["individualName"]["surName"];
        field.position_name = field["positionName"];
        field.organization_name = field["organizationName"];
        field.city = field["address"]["city"];
        field.administrative_area = field["address"]["administrativeArea"];
        field.country = field["address"]["country"];
        field.postal_code = field["address"]["postalCode"];
        field.address = field["address"]["deliveryPoint"]
        field.email = field["electronicMailAddress"];
        delete field["individualName"];
        delete field["positionName"];
        delete field["organizationName"];
        delete field["electronicMailAddress"];
*/

    }
}


