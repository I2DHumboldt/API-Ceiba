'use strict'
/**
 * Created by acastillo on 11/13/16.
 */

const fs = require('fs');
const xml2js = require('xml2js');
const set = require('set-value');
const get = require('get-value');
const JSZip = require('jszip');
const Promise = require('promise');

/**
 * This function converts the given occurrence.txt in a JSON.
 * The fields and names are given by the DwacMapper
 * @param filename
 * @param mapper
 */
function occurrenceConverter(text, mapper) {
    let lines = text.split('\n');//fs.readFileSync(filename).toString().split('\n');
    let head = (lines.splice(0, 1))[0].split("\t");//Get the header
    //Remove the last line if empty. Most of the csv end with a blank line
    if(lines[lines.length-1].length === 0){
        lines.splice(lines.length-1, 1);
    }
    let column2Alias = {};
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
    let collection = lines.map(function(row) {
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
        //return null;
    });

    return collection;
}
/**
 * This function converts the eml.xml file in a JSON
 * @param filename
 * @param mapper
 */
function emlConverter(content, mapper) {
    let  parser = new xml2js.Parser();
    //let content = fs.readFileSync(filename).toString();
    var data = null;
    parser.parseString(content, function (err, result) {
        if(!err)
            data = result['eml:eml']||result['ns0:eml'];

    });
    if(data === null)
        return null;
    //Get the fields specified in the emlMapper.json
    let result = {};
    emlParse(mapper, data, result);
    //console.log(result);

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
    if(!data)
        return;
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
function metaConverter(content, mapper){
    let  parser = new xml2js.Parser();
    //let content = fs.readFileSync(filename).toString();
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
                            result[process["key"]] = occurrenceConverter(fs.readFileSync(dirname+f).toString(), process["mapper"]);
                            break;
                        case "eml.xml":
                            result[process["key"]] = emlConverter(fs.readFileSync(dirname+f).toString(), process["mapper"]);
                            break;
                        case "meta.xml":
                            result[process["key"]] = metaConverter(fs.readFileSync(dirname+f).toString(), process["mapper"]);
                            break;
                        case "occurrence_extension.txt":
                            result[process["key"]] = occurrenceConverter(fs.readFileSync(dirname+f).toString(), process["mapper"]);
                            break;
                    }
                });
            }
        }
    });

    return result;
}

function loadFromZip(zipFile, toParse) {
    let zipContent = fs.readFileSync(zipFile);
    return JSZip.loadAsync(zipContent).then(function (zip) {
        let result = {};
        let promises = [];
        for(let f in zip.files) {
            for (let name in toParse) {
                if (f === name) {
                    let procs = toParse[name];
                    procs.forEach(function(process) {
                        switch(f) {
                            case "occurrence.txt":
                                promises.push(zip.file(f).async("text").then(text => {
                                    let tmp = {};
                                    tmp[process["key"]] = occurrenceConverter(text, process["mapper"]);
                                    return tmp;
                                }));
                                break;
                            case "eml.xml":
                                promises.push(zip.file(f).async("text").then(text => {
                                    let tmp = {};
                                    tmp[process["key"]] = emlConverter(text, process["mapper"]);
                                    return tmp;
                                }));
                                break;
                            case "meta.xml":
                                promises.push(zip.file(f).async("text").then(text => {
                                    let tmp = {};
                                    tmp[process["key"]] = metaConverter(text, process["mapper"]);
                                    return tmp;
                                }));
                                break;
                            case "occurrence_extension.txt":
                                /*promises.push(zip.file(f).async("text").then(text => {
                                 let tmp = {};
                                 tmp[process["key"]] = emlConverter(text, process["mapper"]);
                                 return tmp;
                                 }));*/
                                break;
                        }
                    });
                }
            }
        }
        return Promise.all(promises).then(procs => {
            procs.forEach(proc => {
                Object.assign(result, proc);
            });
            return result;
        });
    });
}

module.exports = {loadFromFolder, loadFromZip}




