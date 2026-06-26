# Kubernetes Container Reliance

A containerized Python web application demonstrating **horizontal scaling**, **load balancing**, and **resilience** using Docker Compose and nginx.

Three identical Python HTTP server containers run behind an nginx reverse proxy. Requests are distributed across the pool in round-robin fashion. If any container goes down, nginx automatically fails over to healthy ones — mimicking how Kubernetes distributes traffic across pod replicas.

## Architecture

                   Host port 8081
                        |
                   [nginx:alpine]       Reverse proxy / load balancer
                  /        |        \
                 v         v         v
             [web1]    [web2]    [web3]    Python HTTP servers (port 5000)

- **Reverse proxy** — nginx receives all traffic on port `8081` and load-balances across the three backends.
- **Web containers** — three replicas of a Python 3.11 HTTP server. Each reports its own hostname so you can see which one handled your request.
- **Health checks** — each container serves `/health` (JSON) and nginx is configured to detect and skip unhealthy backends.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd KubernetesContainerApp

# Start all containers with the load balancer
docker compose up --build

# Or run without the proxy (direct per-container access)
docker compose -f docker-compose-no-proxy.yml up --build
Open http://localhost:8081 in your browser. Refresh to see the hostname change as nginx round-robins across containers.
Health endpoint
curl http://localhost:8081/health
# {"status": "healthy", "hostname": "web2", "uptime": "0:01:23"}
Resilience Demo
The setup tolerates container failures without downtime:
# In one terminal, send continuous requests
while true; do curl -s http://localhost:8081 | grep -o "Served by:.*"; sleep 0.5; done

# In another terminal, kill a container
docker compose stop web1
Requests continue uninterrupted — nginx routes traffic to web2 and web3. Restart the killed container and run docker compose stop web2 to see the same behavior.
To simulate a full recovery:
docker compose start web1   # web1 rejoins the pool
Project Structure
├── docker-compose.yml          # Main compose file (with nginx proxy)
├── docker-compose-no-proxy.yml # Alternate compose file (direct access)
├── nginx.conf                  # nginx load balancer configuration
└── web/
    ├── Dockerfile              # Python container image definition
    └── server.py               # Python HTTP server (stdlib, no dependencies)
server.py highlights
- Pure Python stdlib — zero external dependencies.
- GET / — returns an HTML page with the serving container's hostname, start time, and uptime.
- GET /health — returns a JSON health status.
- Configurable port — set via the PORT environment variable (default 5000).
License
Apache License 2.0