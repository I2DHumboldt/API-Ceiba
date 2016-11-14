'use strict'
/**
 * Created by acastillo on 11/13/16.
 */
const fixDate = require("../util/fixDate");

module.exports = function(occurrence) {
    try{
        if(occurrence["latitude"] && occurrence["longitude"]) {
            occurrence["location"] = {
                "lat": occurrence["latitude"],
                "lon": occurrence["longitude"]
            };
            delete occurrence["latitude"];
            delete occurrence["longitude"];
        }
        if(occurrence["maximum_elevation"])
            occurrence["maximum_elevation"] =  +occurrence["maximum_elevation"];
        if(occurrence["minimum_elevation"])
            occurrence["minimum_elevation"] = +occurrence["minimum_elevation"];
        if(occurrence["maximum_depth"])
            occurrence["maximum_depth"] =  +occurrence["maximum_depth"];
        if(occurrence["minimum_depth"])
            occurrence["minimum_depth"] = +occurrence["minimum_depth"];

        if(occurrence["event_date"]){
            let eventDates = occurrence["event_date"].split("/");
            if(eventDates[0]){
                let date = new Date(fixDate(eventDates[0]));
                occurrence["daystart"] = date.getDate();
                occurrence["monthstart"] = date.getMonth();
                occurrence["yearstart"] = date.getFullYear();
            }
            if(eventDates[1]){
                let date = new Date(fixDate(eventDates[1]));
                occurrence["dayend"] = date.getDate();
                occurrence["monthend"] = date.getMonth();
                occurrence["yearend"] = date.getFullYear();
            }
            delete occurrence["event_date"];
        }
    }
    catch (e){
        console.log("Could not convert the date");
    }
    return occurrence;
}
