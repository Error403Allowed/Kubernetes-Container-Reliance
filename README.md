# Kubernetes Container App

A containerized Python web application demonstrating **horizontal scaling**, **self-healing**, and **load balancing** on a local Kubernetes cluster (kind or Docker Desktop).

Three replica pods run behind a Kubernetes Service. Chaos monkey randomly deletes a pod every 5–10 seconds — the ReplicaSet auto-heals and the Service keeps routing traffic to healthy pods. The app is accessible at `localhost:8081` without port-forwarding.

## Architecture

```
                    http://localhost:8081
                         |
             [Service: LoadBalancer]
                   /        |        \
                  v         v         v
              [pod]      [pod]      [pod]    Python HTTP servers (3 replicas)
                                            Chaos monkey deletes one at random
                                            ReplicaSet replaces it immediately
```

- **Service** — LoadBalancer on port `8081` distributes traffic across all ready pods.
- **Deployment** — 3 replica pods, each running a Python 3.11 HTTP server.
- **Health checks** — each pod serves `/health` (JSON).
- **Chaos monkey** — a separate pod that deletes a random web pod every 5–10 seconds, forcing the system to self-heal.

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) with Kubernetes enabled
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

## Getting Started

```bash
# 1. Build the web container image
docker compose build

# 2. Deploy everything to Kubernetes
kubectl apply -f k8s/

# 3. Open the app
open http://localhost:8081
```

## What to Expect

Two things happen at once:

### Load Balancing (every request)
The Service round-robins across all 3 pods. Every time you refresh or curl, a **different pod** may respond — so the hostname, start time, and uptime change on every request even without chaos.

```bash
# Watch the hostname change on every request
while true; do curl -s http://localhost:8081/health | python3 -m json.tool; sleep 1; done
```

### Chaos Monkey (every 5–10 seconds)
Every 5–10 seconds the chaos monkey kills one pod. The ReplicaSet immediately creates a replacement. In the pod watch, you'll see one pod disappear and a new one appear.

```bash
# Watch pods get killed and recreated
kubectl get pods -l app=web-app -w
```

To tell them apart:
- **Load balancing** — hostname flips between 3 (or 4) pods, all different start times
- **Chaos monkey** — a pod disappears completely and a brand-new one (young uptime) appears

To stop the chaos monkey:

```bash
kubectl delete deployment chaos-monkey
```

To stop everything:

```bash
kubectl delete -f k8s/
```

## Project Structure

```
├── docker-compose.yml         # Builds the web image (not for orchestration)
├── k8s/
│   ├── deployment.yaml         # Web app Deployment (3 replicas)
│   ├── service.yaml            # LoadBalancer Service (port 8081)
│   └── chaos-deployment.yaml   # Chaos monkey pod (5–10s interval)
└── web/
    ├── Dockerfile              # Python container image definition
    ├── server.py               # Python HTTP server (stdlib, no dependencies)
    ├── frontend/               # React/TypeScript source (Vite)
    └── static/                 # Built frontend assets
```

## API

| Endpoint | Response |
|---|---|
| `GET /` | SPA frontend showing hostname, start time, uptime |
| `GET /health` | `{"status": "healthy", "hostname": "pod-name", "started": "...", "uptime": "..."}` |

## License

Apache License 2.0
