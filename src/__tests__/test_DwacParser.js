/**
 * Created by acastillo on 11/13/16.
 */
const DwacParser = require("..").dwacParser;

describe('Darwin-Core parser', function () {
    it('Should load the 3 main files', function () {
        var dwac = DwacParser.loadFromFolder(__dirname+"/../../data-test/resource/dwca-sanpedro_flora_2014");
        dwac["occurrence.txt"].should.be.obj;
        dwac["eml.xml"].should.be.obj;
    });
});