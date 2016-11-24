// Dependencies
const convict = require('convict');
const util = require('util');
const path = require('path');

const config = convict({
    env: {
        doc: 'Application environment.',
        format: ['production', 'development'],
        default: 'development',
        env: 'NODE_ENV'
    },
    logs: {
        doc: 'Log save location',
        default: 'logs/dataportal-api.log',
        env: 'LOG'
    },
    source: {
            doc: 'The folder where the Darwin-Core data is located',
            default: "./data-test/resource/",
            env: 'CEIBA_RESOURCES'
    },
    database: {
        elasticSearch: {
            url: {
                doc: 'ElasticSearch url to connect to (without including db reference)',
                default: 'localhost:9200',
                env: 'ESDBHOST'
            },
            index: {
                doc: 'ElasticSearch index db reference',
                default: 'sibdataportal',
                env: 'ESINDEX'
            }
        }
    }
}).loadFile(path.join(__dirname, 'config.json')).validate();

// catch all error without handler
process.on('uncaughtException', error => {
    console.log(`Caught exception without specific handler: ${util.inspect(error)}`);
    console.log(error.stack, 'error');
    process.exit(1);
});

// perform the config validation
config.validate();

module.exports = config;