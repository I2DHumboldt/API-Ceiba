# dbscripts

## reset_database.sh
Esta carpeta contiene los scripts para definir los mapping de elasticsearch. La secuencia de comandos comienza
borrando los datos anteriores. Después crea el mapeo de la estructura de las occurrencias y la estructura de los
resources. 
Este script debe ejecutarse antes de comenzar la migración de los datos.

### script

``` bash
#!/usr/bin/env bash

if [ -z ${ESDBHOST} ]; then
 export ESDBHOST='localhost:9200'
 echo "Setting ESDBHOST = '$ESDBHOST'"
fi

if [ -z ${ESINDEX} ]; then
 export ESINDEX='sibdataportal'
 echo "Setting ESINDEX = '$ESINDEX'"
fi

if [ -e ./mappings/elasticsearch/delete_index.sh ]; then
    . mappings/elasticsearch/delete_index.sh
    . mappings/elasticsearch/create_mapping_occurrence.sh
    . mappings/elasticsearch/create_mapping_resource.sh
else if [ -e ./dbscripts/mappings/elasticsearch/delete_index.sh ]; then
        . dbscripts/mappings/elasticsearch/delete_index.sh
        . dbscripts/mappings/elasticsearch/create_mapping_occurrence.sh
        . dbscripts/mappings/elasticsearch/create_mapping_resource.sh
    else
        echo "Could not find delete_index.sh"
    fi
fi
```

### Ejecutar

./reset_database.sh

## elasticdump.sh

Este script realiza la migración de la base de datos de pruebas a la base de datos de producción, usando la herramienta
[elasticdump](https://www.npmjs.com/package/elasticdump). Esta es una tarea que se debe realizar de forma manual, ya que requiere
que la base de datos de pruebas se haya validado. 

### Ejecutar
Para migrar el índice sibdataportal  al índice sibdataportal2 dentro del host local, en una instancia de ElasticSearch
sobre el puerto 9200, se debe ejecutar este comando.

``` bash
./dbscripts/elasticdump.sh http://localhost:9200/sibdataportal http://localhost:9200/sibdataportal2
```

El script le pide confirmación para comenzar el proceso de migración. Se debe respoder *Y/N*

**Nota**  _tanto el origen como el destino pueden encontrarse en cualquier otro host diferente al localhost o sobre
puertos diferentes al 9200._