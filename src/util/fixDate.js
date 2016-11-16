/**
 * This function validates the dates
 * Created by acastillo on 11/13/16.
 */
module.exports = function(date) {
    try{
        var day = new Date(date).getDate();
        var month = new Date(date).getMonth();
        var year = new Date(date).getFullYear();

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
        return year+'-'+month+'-'+day;
    }
    catch(e){
        return null;
    }

}
