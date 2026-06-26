# Kubernetes Container App

A containerized Python web application demonstrating **horizontal scaling**, **self-healing**, and **load balancing** on a local [kind](https://kind.sigs.k8s.io/) Kubernetes cluster.

Three replica pods run behind a Kubernetes Service. Chaos monkey randomly deletes a pod every 5–10 seconds — the ReplicaSet auto-heals and the Service keeps routing traffic to healthy pods. The app is accessible at `localhost:8081` without port-forwarding.

## Architecture

```
                    http://localhost:8081
                         |
               [Service: NodePort :30081]
                   /        |        \
                  v         v         v
              [pod]      [pod]      [pod]    Python HTTP servers (3 replicas)
                                            Chaos monkey deletes one at random
                                            ReplicaSet replaces it immediately
```

- **kind** — local Kubernetes cluster with port mapping `30081 → 8081`.
- **Service** — NodePort on port `30081` distributes traffic across all ready pods.
- **Deployment** — 3 replica pods, each running a Python 3.11 HTTP server.
- **Health checks** — each pod serves `/health` (JSON).
- **Chaos monkey** — a separate pod that deletes a random web pod every 5–10 seconds, forcing the system to self-heal.

## Prerequisites

- [Homebrew](https://brew.sh/)
- [Docker Desktop](https://docs.docker.com/get-docker/)
- [kind](https://kind.sigs.k8s.io/) — installed via `brew install kind`
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

## Getting Started

```bash
# 1. Install kind
brew install kind

# 2. Create the cluster
kind create cluster --config k8s/kind-config.yaml

# 3. Build the web container image
docker compose build

# 4. Load the image into kind
kind load docker-image k8s-container-app

# 5. Deploy everything to Kubernetes
kubectl apply -f k8s/

# 6. Open the app
open http://localhost:8081
```

Refresh to see the hostname change as the Service load-balances across pods.

## Chaos Monkey

The chaos monkey pod runs automatically. It:

1. Picks a random running web pod
2. Deletes it with `kubectl delete pod`
3. Sleeps 5–10 seconds
4. Repeats forever

The Kubernetes ReplicaSet controller detects the deleted pod and immediately creates a replacement. The Service seamlessly routes traffic to the remaining pods during the transition.

To watch chaos in action:

```bash
# Terminal 1 — watch pods get killed and recreated
kubectl get pods -l app=web-app -w

# Terminal 2 — watch the hostname change as traffic shifts
while true; do curl -s http://localhost:8081/health | python3 -m json.tool; sleep 1; done
```

To stop the chaos monkey:

```bash
kubectl delete deployment chaos-monkey
```

To stop everything:

```bash
kubectl delete -f k8s/
kind delete cluster
```

## Project Structure

```
├── docker-compose.yml         # Builds the web image (not for orchestration)
├── k8s/
│   ├── kind-config.yaml        # kind cluster config (port 30081 → 8081)
│   ├── deployment.yaml         # Web app Deployment (3 replicas)
│   ├── service.yaml            # NodePort Service (port 30081)
│   ├── chaos-rbac.yaml         # ServiceAccount + RBAC for chaos monkey
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
