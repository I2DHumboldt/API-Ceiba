'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fixDate = require('../util/fixDate');
const logger = require('../log');

function filterOccurrence(occurrence) {
    try{
        /*occurrence['group'] = ['humboldt'];
        if(Math.random() > 0.5)
            occurrence['group'].push('guess');*/

        //This is an important field and can only be parse if it exists and it is complete
        if(occurrence['location']) {
            if(occurrence['location']['lat'] && occurrence['location']['lon']) {
                occurrence['location']['lat'] = +occurrence['location']['lat'];
                occurrence['location']['lon'] = +occurrence['location']['lon'];
            } else {
                delete occurrence['location'];
            }

        }
        if(occurrence['maximum_elevation'])
            occurrence['maximum_elevation'] = +occurrence['maximum_elevation'];
        if(occurrence['minimum_elevation'])
            occurrence['minimum_elevation'] = +occurrence['minimum_elevation'];
        if(occurrence['maximum_depth'])
            occurrence['maximum_depth'] = +occurrence['maximum_depth'];
        if(occurrence['minimum_depth'])
            occurrence['minimum_depth'] = +occurrence['minimum_depth'];

        if(occurrence['event_date']){
            try {
                let eventDates = occurrence['event_date'].split('/');
                if (eventDates >= 3) {
                    eventDates = [eventDates[2] + '-' + eventDates[1] + '-' + eventDates[0]];
                }
                if (eventDates[0] && eventDates[0].length >= 4) {
                    let date = fixDate(eventDates[0]);
                    occurrence['eventdate_start'] = date;
                    date = new Date(date);
                    occurrence['days_tart'] = date.getUTCDate();
                    occurrence['month_start'] = date.getUTCMonth() + 1;
                    occurrence['year_start'] = date.getUTCFullYear();
                }
                if (eventDates[1] && eventDates[1].length >= 4) {
                    let date = fixDate(eventDates[1]);
                    occurrence['eventdate_end'] = date;
                    date = new Date(date);
                    occurrence['day_end'] = date.getUTCDate();
                    occurrence['month_end'] = date.getUTCMonth() + 1;
                    occurrence['year_end'] = date.getUTCFullYear();
                }
            }
            catch(err) {
                logger.log('warn','Could not convert the date', occurrence);
            }
            delete occurrence['event_date'];
        }
    }
    catch (e){
        logger.log('warn','Could not properly convert the occurrence', occurrence);
    }

    return occurrence;
}

module.exports = filterOccurrence;
