# API-data-importer

Este programa realiza la importación de los catálogos de información del Instituto Humboldt almacenados en una carpeta
del servidor de CEIBA (en formato Darwin-Core), sobre una base de datos de ElasticSearch.

## Requerimientos

Software  | Versión | Instrucciones de instalación
------------- | ------------- | -------------
Java | 1.8 o superior | (https://www.java.com/en/download/)
ElasticSearch | 5 | (https://www.elastic.co/products/elasticsearch)
Kibana (Optional) | 5 | (https://www.elastic.co/products/kibana)
NodeJS | 4 o superior | (https://nodejs.org/en/download/)
NPM | 3.10.6 o superior | (https://docs.npmjs.com/getting-started/installing-node)
elasticdump |^2.4.2 | [npm install elasticdump -g](https://www.npmjs.com/package/elasticdump)

* Después de instalar Java se deben exportar las el JAVA_HOME. Ejemplo:

``` bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_101.jdk/Contents/Home/jre/
```

## Instalación

``` bash
git clone https://github.com/I2DHumboldt/api-data-importer.git
npm install
```

## Configuración

Toda la configuración de la aplicación se define en la carpeta `config`. Para modificar el comportamiento del proceso de 
importación de los datos siga las instrucciones del [README.md](https://github.com/I2DHumboldt/api-data-importer/tree/master/config) de esta carpeta. 

La configuración básica necesaria, es la definición del origen y el destino de los datos a importar. Estos parámetros se 
pueden editar en el archivo [config/config.json](config/config.json), pero serán sobre-escritos por los valores de las variables de 
entorno para esas mismas variables (Ver las instrucciones de la carpeta [config](https://github.com/I2DHumboldt/api-data-importer/tree/master/config)).
Por defecto el sistema tratará de importar en la base de datos de ElasticSearch que se encuentra en "localhost:9200" y sobre el índice 
sibdataportal, desde la carpeta de datos de prueba [data-test/resource/](data-test/resource/) que contiene 2 recursos para importar.

``` js
{
  "database": {
    "elasticSearch":{
      "url": "localhost:9200",
      "index": "sibdataportal"
    }
  },
  "source": "./data-test/resource/",
  "log":{
    "env": "production",
    "filename": "./logs/ceiba-data-importer.log"
  }
}
```

**Nota**: _Esta configuración es para pruebas!!!_
Los parámetros definidos aquí para la base de datos de ElasticSearch, deben ser los mismos que los definidos en el script que prepara la base de datos. 
Si se quiere modificar la configuración de la aplicación, la forma correcta es exportar las variables de entorno **ESDBHOST** y  **ESINDEX** que espera el archivo [dbscripts/reset_database.sh] (https://github.com/I2DHumboldt/api-data-importer/blob/master/dbscripts/reset_database.sh) 
Si las variables de entorno no se definen antes de ejecutar el script, se exportarán las variables con los valores por defecto:

```
export CEIBA_RESOURCES=/usr/ceiba/resources/
export ESDBHOST=localhost:9200
export ESINDEX=sibdataportal
...
```

### logger con Wiston

Adicionalmente en este archivo de configuración se definen los parámetros para los mensajes (log) del proceso. 
Hay 2 tipos de ejecución, que se pueden definir para el logger del proceso, cambiando el valor de la variable 
log.env: 'production', que almacena todos los mensajes del logger en el archivo especificado por `filename` (por defecto 
en `./logs/ceiba-data-importer.log`) o 'development', que lanza todos los mensajes de error sobre la consola del sistema. 
El tipo de ejecución por defecto es 'production'. 

## Ejecución

### Preparar la base de datos de ElasticSearch para la importación

Este script limpia la base de datos de elasticSearch donde se almacenarán los datos de la importación y crea los mapping respectivos de `occurrence` y `resource`. Para mayores detalles consulte la documentación de [dbscripts](dbscripts)

``` bash
nmp run prepare
```

### Importar los datos a ElasticSearch

``` bash
npm run import
```

## Poner la base de datos en producción

Una vez que los datos están migrados correctamente se pueden pasar a producción. Para evitar periodos donde la base de 
datos no esté disponible, la migración no se realiza directamente sobre la base datos de producción sino sobre una base 
de datos local. Esta base de datos se copia sobre el cluster de producción de elasticSearch con un nombre cualquiera, 
por ejemplo sibdataportalv2.

### Elasticdump

Para esto se recomienda usar la librería https://www.npmjs.com/package/elasticdump:

#### Instalación

``` bash
npm install elasticdump -g
```

#### Copiar un índice de la base de datos de desarrollo a la de producción con analyzer y mapping:

Cada vez se debe copiar la base de datos de prueba sobre un índice diferente al último. Es decir, si la vez anterior se importó sobre **sibdataportalv1**, esta vez deberán importar los datos sobre **sibdataportalv2**, de esta forma evita que el sistema tenga periodos de tiempo muertos.

``` bash
elasticdump \
  --input=http://staging.es.com:9200/sibdataportal \
  --output=http://production.es.com:9200/sibdataportalv2 \
  --type=analyzer

elasticdump \
  --input=http://staging.es.com:9200/sibdataportal \
  --output=http://production.es.com:9200/sibdataportalv2 \
  --type=mapping
  
elasticdump \
  --input=http://staging.es.com:9200/sibdataportal \
  --output=http://production.es.com:9200/sibdataportalv2 \
  --type=data
```

Para facilitar la labor de migración, se ha implementado en [dbscripts/elasticdump.sh](dbscripts/elasticdump.sh) un script para realizar la migración de forma asistida. 
Para realizar la migración de su base de datos local que está en _http://localhost:9200/sibdataportal_ sobre la base de  datos de producción localizada en __http://192.168.0.77:9200/sibdataportal2__ debe ejecutar la siguiente línea de comandos
 

``` bash
./dbscripts/elasticdump.sh http://localhost:9200/sibdataportal http://192.168.0.77:9200/sibdataportal2
```
Lea las instrucciones de la carpeta [dbscripts](dbscripts) si necesita más información.

Una vez migrado el índice a las base de datos de producción, es necesario hacer apuntar el alias **sibdataportal**  a la recién creada sibdataportalv2. Después se puede borrar la versión anterior sibdataportal1. Ej:

```
	POST /_aliases
	{
	    "actions" : [
	        { "remove" : { "index" : "sibdataportalv1", "alias" : "sibdataportal" } },
	        { "add" : { "index" : "sibdataportalv2", "alias" : "sibdataportal" } }
	    ]
	}
```

**!!!Estos pasos son críticos y no se deben automatizar. Deben estar supervisados por una persona !!!**

# Anexos

## Instalar y configurar ElasticSearch 5

Descargar ElasticSearch 5 https://www.elastic.co/products. Es recomendable también instalar Kibana y Logstash.

Edite el archivo de configuración conf/elasticsearch.conf. Lo importante es elegir el nombre del cluster del que hace parte el nodo, el identificador del nodo (nombre) y la red de la que debe aceptar conexiones:

```
	cluster.name:   ${CLUSTER_NAME}
	node.name:   ${HOSTNAME}
	network.host: ${ES_NETWORK_HOST}
```

Para probar la instalación se ejecuta:

``` bash
$ES_HOME/bin/elasticsearch
curl -XGET localhost:9200/_cluster/health?pretty
```
 
Se debe ver una salida como esta:

``` js
 {
 "cluster_name" : "elasticsearch_ceiba-dev",
  "status" : "yellow",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "active_primary_shards" : 5,
  "active_shards" : 5,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 5,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 50.0
 }
 ```

# Testing para desarrolladores

Se han definido 2 Unit Tests con Mocha para probar que el data-importer funciona correctamente. El primer Unit Test es para probar que la importación
funciona correctamente:

```
npm run test-creation
```

El segundo Unit Test sirve para probar que los conteos de los registros por grupos de acceso es correcto. Para eso ejecute:

```
npm run test-count
```

