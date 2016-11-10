# API-Ceiba

API for the CEIBA's data-portal

Spanish version [README.md]

## Introduction

Esta API es una implementación del portal de datos de SIB Colombia a la que se le han agregado algunas modificaciones. Para comenzar vamos a hacer describir los pasos para reproducir esta API sin ninguna modificación para el portal de datos de CEIBA

## Portal de datos del SIB

El portal de datos del SIB comprende un conjunto de herramientas para centralizar y publicar los catálogos de información de los diferentes IPT que tienen registrados. Para lograr esto, fue necesario el desarrollo de varias herramientas que hacen uso a su vez de otras herramientas externas para:

1. La importación de los datos desde los diferentes IPTs (https://github.com/WingLongitude/liger-data-access, https://github.com/WingLongitude/lontra-harvester).
2. El procesamiento, transformación y almacenamiento en una única base de datos de PostgreSQL intermedia (https://github.com/WingLongitude/lontra-harvester).
3. La carga sobre una base de datos ElasticSearch (https://github.com/SIB-Colombia/bambu/tree/master/dbscripts); su exposición a través de un API de consulta en NodeJS (https://github.com/SIB-Colombia/bambu, http://api.biodiversidad.co/api/v1.5/)
4. y por último, la publicación en el sitio del portal de datos del SIB Colombia (http://maps.sibcolombia.net/)

El objetivo principal de este documento es explicar cada una de las herramientas y su configuración para las tareas descritas en los puntos 1, 2, 3. El punto 4 está relacionado con el frontend de la aplicación y está más allá de los objetivos de este proyecto.

## Requisitos previos

Software  | Versión | Instrucciones de instalación
------------- | ------------- | -------------
Java | 1.8 o superior | [https://www.java.com/en/download/]
Maven | 3.3.9 | [http://maven.apache.org/install.html] *  
PostgreSQL | 9.6 (9.1 o superior) | [https://www.postgresql.org/download/]
PostGis | 2.2.3 | [http://postgis.net/install/]
ActiveMQ | 5.14.1 | [http://activemq.apache.org/installation.html]
ElasticSearch | 5 | [https://www.elastic.co/products/elasticsearch]
Logstash | 5 | [https://www.elastic.co/products/logstash]
Kibana (Optional) | 5 | [https://www.elastic.co/products/kibana]

* Después de instalar Java y Maven se deben exportar las rutas de la instalación al PATH del sistema:

```
  export PATH=$PATH:/usr/local/apache-maven-3.3.9/bin/
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_101.jdk/Contents/Home/jre/
```


### Extracción/Importación de los catálogos de información de los IPTs registrados

Preparar la base de datos en PostgreSQL para almacenar los datos intermedios. La definición del esquema de la base de datos se encuentra en el proyecto liger-data-access. Si se quiere crear la base de datos manulamente, por ejemplo si se necesitan incluir modificaciones a la estructura, se deben seguir los siguientes pasos:
```
  #Crear la db dataportal en PostgreSQL y crear la extensión hstore 
	use dataportal;
  CREATE EXTENSION hstore;
  #Crear las tablas, índices y asignar los permisos. Para esto se ejecutan los script de liger-data access/src/main/resources/script/occurrence  en este orden: 
	create_occurrence_table.sql
	create_occurrence_tables_buffer_schema.sql
    create_occurrence_indices.sql
    users_grants.sql
```
sin embargo la aplicación lontra-harvester realiza el setup de forma automática.

Lontra-harvester es una herramienta para la importación de los archivos de ocurrencias Darwin Core (DwC-A) en una base de datos relacional. Para la instalación de lontra-harvester sigua las instrucciones en el wiki del proyecto:
		[https://github.com/WingLongitude/lontra-harvester/wiki/SourceSetup]
 
El siguiente paso es registrar los recursos (archivos de ocurrencias) que se van a importar con lontra-harvester. Esto se puede realizar en la interfaz gráfica mediante la interfaz ui o en consola con la aplicación cli. Para registrar un recurso se debe contar con la siguiente información:
  * Nombre del recurso
  * Url del archivo Darwin Core del recurso
  * applicationID: UUID del recurso o una url si el recurso no está registrado en GBIS.
 
### Procesamiento/Transformación de los datos a una base de datos relacional intermedia
Configuración de las colas con ActiveMQ
Importar los datos con iontra-harverster
  * cli
  * lib
  * node

### Carga de los datos intermedios en una base de datos de ElasticSearch
Crear el index sibdataportal en una máquina local con los script de bambu disponibles en la carpeta: dbscripts/mappings/elasticsearch

```
    /delete_index.sh
    /create_mapping_occurrence.sh
    /create_mapping_resource.sh
```

Cargar los datos desde la base de datos intermedia al índice sibdataportal usando los scripts de carga disponibles en: dbscripts/data_transfer/from_postgres_to_elasticsearch
  * Logstash: Occurrence
  * NodeJS: Resource
  
### Poner la base de datos en producción

Una vez que los datos están migrados correctamente se pueden pasar a producción. Para evitar periodos donde la base de datos no esté disponible, la migración no se realiza directamente sobre la base datos de producción sino sobre una base de datos local. Esta base de datos se copia sobre el cluster de producción de elasticSearch con un nombre cualquiera, por ejemplo sibdataportalv2. Para esto se recomienda usar la librería https://www.npmjs.com/package/elasticdump:

```
# Install
npm install elasticdump -g

Elasticdump

# Copy an index from staging to production with analyzer and mapping:

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

## Correr el API y probar los resultados

El API se pone en funcionamiento desde la raíz del proyecto bambu: 
  `npm start`
Para probar el API vamos en 
  `localhost:5000/api/v1.5`
     
Para acceder a la definición de las funciones del API nos conectamos en:
  ` http://localhost:5000/api-doc/`
  
Y consultamos el archivo de swagger de la API
  `http://localhost:5000/swagger.yaml`
  
Probar una función de la API: `http://localhost:5000/api/v1.5/occurrence/count`, retorna el conteo de ocurrencias de la base de datos

## Conclusiones

Siguiendo los pasos de este manual de instalación y configuración es posible tener una API local de pruebas, que permite importar los datos desde el repositorio de datos de CEIBA. Esta parte del trabajo cubre cerca del 30% del total de la actividad de la implementación de API.

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





