#!/bin/bash

_mydir="$(pwd)"
BASEDIR=$(dirname "$0")

cd "$BASEDIR"
cd ..
cd ..

old="$IFS"
IFS=';'
str="'$*'"
node file-list-archive.js "$str"
IFS=$old

cd $_mydir