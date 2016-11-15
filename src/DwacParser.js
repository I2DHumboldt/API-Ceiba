'use strict'
/**
 * Created by acastillo on 11/13/16.
 */

const fs = require('fs');
const xml2js = require('xml2js');
const set = require('set-value');
const get = require('get-value');
/**
 * This function converts the given occurrence.txt in a JSON.
 * The fields and names are given by the DwacMapper
 * @param filename
 * @param mapper
 */
function occurrenceConverter(filename, mapper) {
    let lines = fs.readFileSync(filename).toString().split('\n');
    let head = (lines.splice(0, 1))[0].split("\t");//Get the header

    let column2Alias = {};
    let result = new Array(lines.length);
    //Convert column names to column indexes and alias
    head.forEach(function(value, index) {
        var alias = mapper[value];
        if(alias) {
            column2Alias[index] = alias;
            if(Array.isArray(alias)){
                column2Alias[index] = alias.join(".")
            }
        }
    });
    //Convert each row in a JSON and return;
    let collection = lines.map(function(row, index) {
        let columns = row.split("\t");
        if(columns.length > 1){
            let doc = {};
            //@TODO Change forEach by a for loop
            columns.forEach(function(value, index) {
                let alias = column2Alias[index];
                if(alias && value) {
                    set(doc, alias, value);
                }
            });
            return doc;
        }
        return null;
    });

    return collection;
}
/**
 * This function converts the eml.xml file in a JSON
 * @param filename
 * @param mapper
 */
function emlConverter(filename, mapper) {
    let  parser = new xml2js.Parser();
    let content = fs.readFileSync(filename).toString();
    var data = {}
    parser.parseString(content, function (err, result) {
        if(!err)
            data = result['eml:eml'];
    });

    //Get the fields specified in the emlMapper.json
    let result = {};
    emlParse(mapper, data, result);

    return result;
}
/**
 * This function converts the data information in a single level documente using the
 * field names and structure specified by the mapper
 * @param mapper
 * @param data
 * @param output
 */
function emlParse(mapper, data, output){
    if(Array.isArray(data)) {
        data.forEach(function(value) {
            emlParse(mapper, value, output);
        })
    } else {
        if(typeof mapper === "string") {
            var value = get(output, mapper);
            if(value) {
                if(Array.isArray(value)){
                    value.push(data);
                } else {
                    set(output, mapper, [value, data]);
                }
            } else {
                set(output, mapper, data);
            }
        } else {
            if(Array.isArray(mapper)) {
                mapper.forEach(function(mapperInArray) {
                    emlParse(mapperInArray, data, output);
                });
            } else if(typeof mapper === "object") {
                for(let key in mapper ) {
                    if(key === "->") {
                        if(!output[mapper[key]]) {
                            //Create a new level in the output
                            let newLevel = {};
                            output[mapper[key]] = newLevel;
                            delete mapper[key];
                            emlParse(mapper["mapper"], data, newLevel);
                        }
                        break;
                    }
                    if(data[key]) {
                        emlParse(mapper[key], data[key], output);
                    }
                }
            }
        }
    }
}

/**
 * This function converts the meta.xml in a JSON
 * @param filename
 * @param mapper
 */
function metaConverter(filename, mapper){
    let  parser = new xml2js.Parser();
    let content = fs.readFileSync(filename).toString();
    var data = {};
    parser.parseString(content, function (err, result) {
        if(!err)
            data = result;
    });
    return data;
}

/**
 * This function reads and parses the content of a Dwac folder.
 * @param folder
 * @param options
 */
function loadFromFolder(dirname, toParse) {

    if( !dirname.endsWith("/") )
        dirname += "/";
    var files = fs.readdirSync(dirname);
    let result = {};
    files.forEach(function(f) {
        for( let name in toParse){
            if(f === name) {
                let procs = toParse[name];
                procs.forEach(function(process) {
                    switch(f) {
                        case "occurrence.txt":
                            result[process["key"]] = occurrenceConverter(dirname+f, process["mapper"]);
                            break;
                        case "eml.xml":
                            result[process["key"]] = emlConverter(dirname+f, process["mapper"]);
                            break;
                        case "meta.xml":
                            result[process["key"]] = metaConverter(dirname+f, process["mapper"]);
                            break;
                        case "occurrence_extension.txt":
                            result[process["key"]] = occurrenceConverter(dirname+f, process["mapper"]);
                            break;
                    }
                });
            }
        }
    });

    return result;
}

module.exports = {loadFromFolder}




