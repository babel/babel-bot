#!/bin/bash
set -ex

pushd dist
cp ../package.json .
cp ../yarn.lock .
yarn install --prod
zip -r ../function.zip .
popd
