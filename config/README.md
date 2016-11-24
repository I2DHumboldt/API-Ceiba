# Config

En esta carpeta se encuentra:
1. [La definición de los mappers](mappers/README.md)
2. [La configuración del origen y destino de los datos](config.json)
3. [Los parámetros del publicador de los datos](publisher.json)

## config-convict.js

La configuración de la aplicación se hace en el archivo de configuración `config/config-convict.js` que usa el manejador
de configuraciones [convict](https://www.npmjs.com/package/convict). Los parámetros de configuración se 
listan en el siguiente JSON.

``` js
{
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
}
```

La variable *source* espera la ruta absoluta a la carpeta del servidor donde se almacenan los Darwin-Core a importar.

Los parámetros de la base de datos de elasticSearch donde se almacenarán los datos se especifican en:

``` js
    database: {
        elasticSearch: {
            url: {
                doc: 'ElasticSearch url to connect to (without including db reference)',
                default: ['localhost:9200'],
                env: 'ESDBHOST'
            },
            index: {
                doc: 'ElasticSearch index db reference',
                default: 'sibdataportal',
                env: 'ESINDEX'
            }
        }
    }
```

Los valores de los parámetros se leen desde las variables de entorno del sistema que estén
definidas. Por ejemplo, si se quiere modificar el parámetro de la url de la base de datos de elasticSearch, se debe exportar una variable
de entorno del sistema, por ejemplo: `export ESDBHOST='192.168.0.1:9200'`. De lo contrario la variable tendrá el valor por defecto (default): *'localhost:9200'*.

**Nota**: _Es importante que esta no sea la base de datos de producción. Solo cuando la importación haya finalizado correctamente
se debe transferir esta base de datos al cluster de producción_

``` js
{
  "database": {
    "elasticSearch":{
      "url": ["localhost:9200"],
      "index": "sibdataportal"
    }
  },
  "source": "/data-test/resource/"
}
```

## info/publisher.json

Los datos del **Instituto Humboldt** como publicador de información. Esta información se agrega a cada registro de la
base de datos para hacerlo compatible con el API del SIB Colombia. Puede editarlos si es necesario.
