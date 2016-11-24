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
