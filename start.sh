#!/bin/sh
set -e

node migrate/migrate.js
node dist/index.js
