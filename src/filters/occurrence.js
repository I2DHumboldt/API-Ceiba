'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fixDate = require("../util/fixDate");
const logger = require('../log');


module.exports = function(occurrence) {
    try{
        occurrence["group"] = ["humboldt"];
        if(Math.random() > 0.5)
            occurrence["group"].push("guess");

        if(occurrence["location"]) {
            occurrence["location"]["lat"] = +occurrence["location"]["lat"];
            occurrence["location"]["lon"] = +occurrence["location"]["lon"]
        }
        if(occurrence["maximum_elevation"])
            occurrence["maximum_elevation"] = +occurrence["maximum_elevation"];
        if(occurrence["minimum_elevation"])
            occurrence["minimum_elevation"] = +occurrence["minimum_elevation"];
        if(occurrence["maximum_depth"])
            occurrence["maximum_depth"] = +occurrence["maximum_depth"];
        if(occurrence["minimum_depth"])
            occurrence["minimum_depth"] = +occurrence["minimum_depth"];

        if(occurrence["event_date"]){
            let eventDates = occurrence["event_date"].split("/");
            if(eventDates[0]){
                let date = fixDate(eventDates[0]);
                occurrence["eventdate_start"] = date;
                date = new Date(date);
                occurrence["days_tart"] = date.getDate();
                occurrence["month_start"] = date.getMonth();
                occurrence["year_start"] = date.getFullYear();
            }
            if(eventDates[1]){
                let date = fixDate(eventDates[1]);
                occurrence["eventdate_end"] = date;
                date = new Date(date);
                occurrence["day_end"] = date.getDate();
                occurrence["month_end"] = date.getMonth();
                occurrence["year_end"] = date.getFullYear();
            }
            delete occurrence["event_date"];
        }
    }
    catch (e){
        logger.log("warn","Could not properly convert the occurrence", occurrence)
    }

    return occurrence;
}
