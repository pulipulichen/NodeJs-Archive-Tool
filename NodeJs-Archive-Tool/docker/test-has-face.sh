#!/bin/bash

/app/git-pull.sh

_mydir="$(pwd)"
BASEDIR=$(dirname "$0")

cd "$BASEDIR"
node test-has-face.js
