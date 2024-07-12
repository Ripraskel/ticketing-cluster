#bin/bash

docker build -f ./auth/Dockerfile -t ripraskelregistry.azurecr.io/ticketing-cluster/auth .
docker push ripraskelregistry.azurecr.io/ticketing-cluster/auth

docker build -f ./tickets/Dockerfile -t ripraskelregistry.azurecr.io/ticketing-cluster/tickets .
docker push ripraskelregistry.azurecr.io/ticketing-cluster/tickets

docker build -f ./expiration/Dockerfile -t ripraskelregistry.azurecr.io/ticketing-cluster/expiration .
docker push ripraskelregistry.azurecr.io/ticketing-cluster/expiration

docker build -f ./orders/Dockerfile -t ripraskelregistry.azurecr.io/ticketing-cluster/orders .
docker push ripraskelregistry.azurecr.io/ticketing-cluster/orders

docker build -f ./payments/Dockerfile -t ripraskelregistry.azurecr.io/ticketing-cluster/payments .
docker push ripraskelregistry.azurecr.io/ticketing-cluster/payments

docker build -f ./client/Dockerfile -t ripraskelregistry.azurecr.io/ticketing-cluster/client ./client
docker push ripraskelregistry.azurecr.io/ticketing-cluster/client