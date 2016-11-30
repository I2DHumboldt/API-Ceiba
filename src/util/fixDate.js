'use strict'
/**
 * This function validates the dates
 * Created by acastillo on 11/13/16.
 */
function fixDate(date) {
    let theDate = Date.parse(date);
    if(Number.isNaN(theDate)) {
        theDate = tryYYYYMMDD(date);
    }
    if(!Number.isNaN(theDate)) {
        theDate = new Date(theDate);
        let day = theDate.getUTCDate();
        let month = theDate.getUTCMonth() + 1;
        let year = theDate.getUTCFullYear();

        if(day < 1) {
            day = 1;
        }
        if(month < 1) {
            month = 1;
        } else if(month > 12) {
            month = 12;
        }

        if (day > 28 && month == 2) {
            day = 28;
        }
        if (day > 31 && (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12)) {
            day = 31;
        }
        if (day > 30 && (month == 4 || month == 6 || month == 9 || month == 11)) {
            day = 30;
        }
        return year + '-' + month + '-' + day;
    } else {
        return '1979-1-1';
    }
}

function tryYYYYMMDD(date) {
    let parts = date.split('-');
    // We suppose it is YYYY-MM-DD
    if(parts.length === 3) {
        let mm = +parts[1];
        let dd = 1;
        let yyyy = 1979;
        if(parts[0].length === 4) {
            dd = +parts[2];
            yyyy = +parts[0];
        }
        // We suppose it is DD-MM-YYYY
        if(parts[2].length === 4) {
            dd = +parts[0];
            yyyy = +parts[2];
        }

        if(Number.isNaN(mm)) {
            mm = 1;
        }
        if(Number.isNaN(dd)) {
            dd = 1;
        }
        if(Number.isNaN(yyyy)) {
            yyyy = 1979;
        }

        if(mm <= 0)
            mm = 1;
        if(mm > 12)
            mm = 12;
        if(dd <= 0)
            dd = 1
        if(dd > 31)
            dd = 31
        if(yyyy < 1979)
            yyyy = 1979;

        return Date.parse(yyyy + '-' + mm + '-' + dd);
    }

    return Number.NaN;
}

module.exports = fixDate;

