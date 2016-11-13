'use strict'
/**
 * Created by acastillo on 11/13/16.
 */

const fs = require('fs');
const xml2js = require('xml2js');
const DwacMapper = require("./../config/dwacMapper.json");

/**
 * This function converts the given occurrence.txt in a JSON.
 * The fields and names are given by the DwacMapper
 * @param filename
 */
function occurrenceConverter(filename){
    let lines = fs.readFileSync(filename).toString().split('\n');
    let head = lines.splice(0, 1).split("\t");//Get the header
    let column2Alias = {};
    let result = new Array(lines.length);
    //Convert column names to column indexes and alias
    head.forEach(function(value, index) {
        var alias = DwacMapper[value];
        if(alias) {
            column2Alias[index] = alias;
        }
    });

    //Convert each row in a JSON and return;
    return lines.map(function(row, index) {
        let columns = row.split("\t");
        let doc = {};
        //@TODO Change forEach by a for loop
        columns.forEach(function(value, index){
            if(column2Alias[index] && value){
                doc[column2Alias[index]] = value;
            }
        });
        return doc;
    });
}
/**
 * This function converts the eml.xml file in a JSON
 * @param filename
 */
function emlConverter(filename){
    var parser = new xml2js.Parser();
    fs.readFile(filename, function(err, data) {
        parser.parseString(data, function (err, result) {
            if(err)
                return {};
            else
                return result;
        });
    });
}

/**
 * This function converts the meta.xml in a JSON
 * @param filename
 */
function metaConverter(filename){
    var parser = new xml2js.Parser();
    fs.readFile(filename, function(err, data) {
        parser.parseString(data, function (err, result) {
            if(err)
                return {};
            else
                return result;
        });
    });
}

/**
 * @TODO Implement this function!!!!
 * This function converts the given occurrence_extension in a JSON.
 * It includes all the tuples of the file
 * @param filename
 */
function extensionConverter(filename){
    let lines = fs.readFileSync(filename).toString().split('\n');
    let head = lines.splice(0, 1).split("\t");//Get the header
    return [];
}

/**
 * This function reads and parses the content of a Dwac folder.
 * @param folder
 * @param options
 */
function loadFromFolder(dirname, opt){
    let options = Object.assign({}, opt);

    if( !dirname.endsWith("/") )
        dirname += "/";

    fs.readdir(dirname, function(err, files) {
        let result = {};
        if (err) return;
        files.forEach(function(f) {
            switch(f) {
                case "occurrence.txt":
                    result[f] = occurrenceConverter(dirname+f);
                    break;
                case "eml.xml":
                    result[f] = emlCoverter(dirname+f);
                    break;
                case "meta.xml":
                    result[f] = metaConverter(dirname+f);
                    break;
                case "occurrence_extension.txt":
                    if(options.extensions) {
                        //@TODO include extensions files
                        result[f] = extensionConverter(dirname+f);
                    }
                    break;
            }
        });

        return result;
    });
}

module.exports = {loadFromFolder}




