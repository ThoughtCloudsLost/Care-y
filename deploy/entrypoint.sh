#!/bin/sh
# Entrypoint for the production api and web images. Disables core dumps for
# the container's process tree (defense in depth on top of the Docker daemon's
# default-ulimits), then replaces itself with the image command.
set -eu
ulimit -c 0
exec "$@"
