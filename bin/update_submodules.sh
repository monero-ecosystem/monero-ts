#!/usr/bin/env bash

# initialize submodules recursively
git submodule update --init --force --recursive

# update monero-core
cd ./external/monero-core
git checkout tags/v0.17.0.1
git pull --ff-only origin tags/v0.17.0.1
cd ../../