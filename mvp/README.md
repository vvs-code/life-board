# MVP-срез

Рабочий срез Life Board из домашних заданий курса: разделы и задачи с CRUD, веб-интерфейс, PostgreSQL. Сделан на лёгком стеке (Express, статика за nginx), чтобы окружение поднималось быстро. Целевая архитектура лежит в корне репозитория, см. [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## Docker Compose

```bash
cd mvp
cp .env.example .env
docker compose up --build
```

Приложение откроется на http://localhost:8080.

## Kubernetes (minikube)

```bash
./mvp/scripts/start-minikube.sh
./mvp/scripts/build-images.sh
kubectl apply -k mvp/k8s/
minikube service frontend -n lifeboard
```

## Тесты

```bash
cd mvp/backend && npm install && npm test
```
