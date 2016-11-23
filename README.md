# API-data-importer

Este programa realiza la importación de los catálogos de información del Instituto Humboldt almacenados en una carpeta
del servidor de CEIBA (en formato Darwin-Core), sobre una base de datos de ElasticSearch.

## Requerimientos

Software  | Versión | Instrucciones de instalación
------------- | ------------- | -------------
Java | 1.8 o superior | [https://www.java.com/en/download/]
ElasticSearch | 5 | [https://www.elastic.co/products/elasticsearch]
Kibana (Optional) | 5 | [https://www.elastic.co/products/kibana]

* Después de instalar Java se deben exportar las el JAVA_HOME. Ejemplo:

```
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_101.jdk/Contents/Home/jre/
```


## Instalación

``` js
git clone https://github.com/I2DHumboldt/api-data-importer.git
npm install
```

## Configuración

## Ejecución

### Poner la base de datos en producción

Una vez que los datos están migrados correctamente se pueden pasar a producción. Para evitar periodos donde la base de datos no esté disponible, la migración no se realiza directamente sobre la base datos de producción sino sobre una base de datos local. Esta base de datos se copia sobre el cluster de producción de elasticSearch con un nombre cualquiera, por ejemplo sibdataportalv2. Para esto se recomienda usar la librería https://www.npmjs.com/package/elasticdump:

```
#### Install
npm install elasticdump -g

Elasticdump

#### Copy an index from staging to production with analyzer and mapping:

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

y después se hace apuntar el alias sibdataportal a la base de datos sibdataportalv2. Después se puede borrar la versión anterior sibdataportal1. Ej:

```
	POST /_aliases
	{
	    "actions" : [
	        { "remove" : { "index" : "sibdataportalv1", "alias" : "sibdataportal" } },
	        { "add" : { "index" : "sibdataportalv2", "alias" : "alias1" } }
	    ]
	}
```

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

 ```
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
