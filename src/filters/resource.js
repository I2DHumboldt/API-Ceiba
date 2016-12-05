'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fixDate = require('../util/fixDate');

function filterResource(resource){
    //Add the missing fields and transform fields
    //@TODO Check this with the supervisor
    resource['publication_date'] = fixDate(resource['publication_date']);

    //Add the access group for the resource based on the intellectual rights
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

    let rai = resource['alternate_identifier'];
    if(rai) {
        for(let i = 0; i < rai.length; i++ ) {
            //Omgggg this is cumbersome and perhaps not enough general!!!
            let indexOf = rai[i].indexOf('?r=');
            if(indexOf >= 0) {
                resource['name'] = rai[i].substring(indexOf+3);
                break;
            }
        }
    }

    resource['contact'] = [];
    contactFilter(resource, 'resource_creator',  'resource_creator');
    contactFilter(resource, 'metadata_provider',  'metadata_provider');
    contactFilter(resource, 'agent',  'agent');
    contactFilter(resource, 'resource_contact',  'contact');

    return resource;
}

function contactFilter(resource, contact, rol) {
    var field = resource[contact];
    if(field) {
        field.rol = rol;
        field.publisher_fkey = 1;
        resource['contact'].push(field);
        delete resource[contact];
    }
}

module.exports = filterResource;
