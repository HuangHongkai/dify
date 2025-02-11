#!/bin/bash
set -e
npm run build
rm -rf /opt/data/dify/standalone
mv .next/standalone /opt/data/dify/standalone
mv .next/static /opt/data/dify/standalone/.next/static
systemctl restart dify
