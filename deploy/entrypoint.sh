#!/bin/sh
# Entrypoint for the production api and web images. Disables core dumps for
# the container's process tree (defense in depth on top of the Docker daemon's
# default-ulimits), then replaces itself with the image command.
set -eu
# The images are Debian slim, whose /bin/sh is dash; dash implements ulimit -c.
# shellcheck disable=SC3045
ulimit -c 0
exec "$@"
