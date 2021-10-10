#!/bin/bash

_mydir="$(pwd)"
BASEDIR=$(dirname "$0")

cd "$BASEDIR"
cd ..
cd ..

old="$IFS"
IFS=';'
str="'$*'"
node bundle-photos.js "$str"
IFS=$old

cd $_mydir