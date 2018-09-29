#!/bin/bash

CURRENT_DIR=$(dirname $0)
PACKAGES_ROOT="${CURRENT_DIR}/../packages"
PACKAGE_NAME=$1
PACKAGE_PATH="${PACKAGES_ROOT}/${PACKAGE_NAME}"

function error() {
    echo "[ERROR!] $1" >&2
}

if [ "${PACKAGE_NAME}" = "" ]; then
    error "package name must be specified"
    exit 1
fi

if [ -d "${PACKAGE_PATH}" ]; then
    error "package '${PACKAGE_NAME}' already exists"
    # exit 1
fi

mkdir -p ${PACKAGE_PATH}/src
cat <<-EOS > "${PACKAGE_PATH}/package.json"
{
  "name": "@yssk22/${PACKAGE_NAME}",
  "version": "1.0.0",
  "description": "My Package",
  "author": "yssk22 <yssk22@gmail.com",
  "license": "MIT",
  "dependencies": {
  },
  "scripts": {
    "test": "./../../node_modules/.bin/jest",
    "flow": "./../../node_modules/.bin/flow check"
  }
}
EOS

cat <<-EOS > "${PACKAGE_PATH}/index.js"
/* @flow */
export * from './src/index';
EOS

cat <<-EOS > "${PACKAGE_PATH}/src/index.js"
/* @flow */
export {};
EOS


echo "package '${PACKAGE_NAME}' created, running create-symlinks for consistency".
${CURRENT_DIR}/create-symlinks.sh

echo "run yarn install at package '${PACKAGE_NAME}'"
pushd ${PACKAGE_PATH}
yarn install
popd