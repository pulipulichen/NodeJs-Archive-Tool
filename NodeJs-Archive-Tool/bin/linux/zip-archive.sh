#!/bin/bash

_mydir="$(pwd)"
BASEDIR=$(dirname "$0")

cd "$BASEDIR"
cd ..
cd ..
node zip-archive.js $1
cd $_mydir