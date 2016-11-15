# Config

En esta carpeta se encuentra:
1. (La definición de los mappers) [mappers/README.md]
2. La configuración del origen y destino de los datos [config.json]
3. Los datos del publicador de los datos [publisher.json]

## config.json
En este archivo se define la base de datos (_database_) de ElasticSearch en la cual se guardarán los datos durante la importación
 y el directorio origen de los datos (_source_)

**Nota**: _Es importante que esta no sea la base de datos de producción. Solo cuando la importación haya finalizado correctamente
se debe transferir esta base de datos al cluster de producción_

```js
{
  "database": {
    "elasticSearch":{
      "url": ["localhost:9200"],
      "index": "sibdataportal"
    }
  },
  "source": "/data-test/resource/"
}
``

## published.json

Los datos del **Instituto Humboldt** como publicador de información. Esta información se agrega a cada registro de la
base de datos para hacerlo compatible con el API del SIB Colombia.
