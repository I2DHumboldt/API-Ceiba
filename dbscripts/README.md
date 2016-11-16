# dbscripts

Esta carpeta contiene los scripts para definir los mapping de elasticsearch. La secuencia de comandos comienza
borrando los datos anteriores. Después crea el mapeo de la estructura de las occurrencias y la estructura de los
resources. 
Este script debe ejecutarse antes de comenzar la migración de los datos

## script

``` bash
#!/usr/bin/env bash
export ESDBHOST=localhost:9200
export ESINDEX=sibdataportal

./mappings/elasticsearch/delete_index.sh
./mappings/elasticsearch/create_mapping_occurrence.sh
./mappings/elasticsearch/create_mapping_resource.sh
``

## Ejecutar

./reset_database.sh