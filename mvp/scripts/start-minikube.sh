#!/usr/bin/env sh
# Запуск minikube, пригодного для `eval $(minikube docker-env)`.
set -eu

# --container-runtime=docker обязателен: в minikube 1.39 по умолчанию containerd,
# а с ним `minikube docker-env` не работает.
#
# --docker-opt dns=... — публичный DNS для контейнеров сборки (npm ci).
# Нужен, когда хост ходит в сеть через локальный прокси/VPN и DNS Docker Desktop
# внутри контейнеров не резолвит имена. В обычной сети флаги безвредны.
#
# --base-image — образ ноды с Docker Hub: оттуда он качается заметно быстрее, чем с gcr.io.
minikube start \
  --driver=docker \
  --container-runtime=docker \
  --base-image=kicbase/stable:v0.0.51 \
  --cpus=4 \
  --memory=4096 \
  --docker-opt dns=8.8.8.8 \
  --docker-opt dns=1.1.1.1

minikube status
