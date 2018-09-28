#!/bin/bash

PACKAGES_ROOT=$(dirname $0)/../packages
PACKAGES=$(find $PACKAGES_ROOT -name 'package.json' -depth 2)

for PKG in $PACKAGES
do
    PKG_DIR=$(dirname $PKG)
    echo $PKG_DIR
    pushd $PKG_DIR
    ln -fs ./../../.flowconfig-package .flowconfig
    ln -fs ./../../jest.config.js
    ln -fs ./../../jest.transform.js
    popd 
done