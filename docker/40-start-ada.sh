#!/bin/sh
# nginx:alpine runs executable scripts in /docker-entrypoint.d/ before
# nginx starts. Ada answers /api/ada; nginx still serves the pages.
export ADA_HOST="${ADA_HOST:-127.0.0.1}"
export ADA_PORT="${ADA_PORT:-8420}"
export ADA_VISITOR_NAME="${ADA_VISITOR_NAME:-}"
python3 /opt/ada/ada_server.py &
