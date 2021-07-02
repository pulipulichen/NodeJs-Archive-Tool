#!/bin/bash

_mydir="$(pwd)"
BASEDIR=$(dirname "$0")

cd "$BASEDIR"
cd ..
cd ..
node bundle-files.js "$1"
cd $_mydir