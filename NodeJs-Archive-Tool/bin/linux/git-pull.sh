#!/bin/bash

_mydir="$(pwd)"
BASEDIR=$(dirname "$0")

cd "$BASEDIR"
cd ..
cd ..

git pull