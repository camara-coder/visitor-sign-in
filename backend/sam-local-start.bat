@echo off
REM Set DB_HOST environment variable directly for the SAM CLI session
SET DB_HOST=host.docker.internal
sam local start-api --env-vars env.json