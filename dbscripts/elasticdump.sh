#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo "elasticdump: Migrate an ElasticSearch index with analyser, mapping and data from source to destination"
    echo " Parameters"
    echo "      source: The origin index, with protocol, host and index"
    echo "      destination: The destination index, with protocol host and index"
    echo " Example: ./elasticdump.sh http://localhost:9200/sourceIndex http://localhost:9200/destinationIndex"
    exit
fi

from=$1
to=$2

read -p "You are about to migrate from db '$from' to '$to'. Do you want to continue? Y/N: " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    elasticdump --input=$from --output=$to --type=analyzer
    echo "Analizer was migrated"

    elasticdump --input=$from --output=$to  --type=mapping
    echo "Mapping was migrated"

    elasticdump --input=$from --output=$to --type=data --searchBody '{"query": { "match_all": {} }, "stored_fields": ["*"], "_source": true }'
    echo "Data was migrated"
fi


