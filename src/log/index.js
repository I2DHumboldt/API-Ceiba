'use strict'
/**
 * Created by acastillo on 11/16/16.
 */
const winston = require('winston');
const _config = require('../../config/config.json');

let logger2 = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)()
    ]
});

// logger dev and production config
if (_config.log.env === 'development') {
    logger2 = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)()
        ]
    });
} else if (_config.log.env  === 'production') {
    logger2 = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)({
                level: 'error'
            }),
            new(winston.transports.File)({
                filename: _config.log.filename
            })
        ]
    });
}

module.exports = logger2;
