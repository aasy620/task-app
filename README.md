# TaskTrack-App

A simple task tracker with a web UI and a REST API, built with Node.js (no external dependencies) and containerized with Docker.

## Tech Stack

- Node.js 18 (built-in `http` module)
- Docker

## Run with Docker

Make sure Docker Desktop is running, then:

```bash
docker build -t tasktrack-app .
docker run -d --name tasktrack -p 3000:3000 tasktrack-app
```

## Stop and Clean Up

```bash
docker stop tasktrack
docker rm tasktrack
docker rmi tasktrack-app
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| PORT | 3000 | Port the app listens on inside the container |

To use a different host port, change the left side of the mapping, for example `-p 3001:3000`.

## How to Test

- **Web UI:** open http://localhost:3000, add a task, click it to mark it done, click `x` to delete it.
- **Health check:** `curl http://localhost:3000/health` returns `{"status":"ok"}`.
- **API:**
  - `GET /api/tasks` lists tasks
  - `POST /api/tasks` creates a task (JSON body: `{"title":"My task"}`)
  - `PATCH /api/tasks/:id` toggles done
  - `DELETE /api/tasks/:id` deletes a task

Note: tasks are stored in memory, so they are lost when the container restarts.

## Attribution

Original project written from scratch. No third-party code or libraries.