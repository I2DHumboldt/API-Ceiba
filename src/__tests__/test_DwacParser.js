/**
 * Created by acastillo on 11/13/16.
 */
const DwacParser = require("..").dwacParser;
const occurrenceMapper = require("./../../config/occurrenceMapper.json");
const emlMapper = require("./../../config/emlMapper.json");
const resourceMapper = require("./../../config/resourceMapper.json");

describe('Darwin-Core parser', function () {
    it('Should load the 3 main files', function () {
        var data = __dirname+"/../../data-test/resource/dwca-sanpedro_flora_2014";
        var dwac = DwacParser.loadFromFolder(data,
            {"occurrence.txt":[{"key":"occurrence", "mapper": occurrenceMapper}],
            "eml.xml":[{"key":"occResource", "mapper": emlMapper},
                {"key":"resource", "mapper":resourceMapper}]});
        dwac["occurrence"].should.be.obj;
        dwac["occResource"].should.be.obj;
        dwac["resource"].should.be.obj;
    });
});