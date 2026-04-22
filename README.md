# Video processing (queue + worker)

Small **Node.js** service that accepts **image or video** uploads, stores metadata in **MongoDB**, enqueues a job on **RabbitMQ**, and processes files in a **separate worker** using **FFmpeg** (WebP for images, compressed video for video).

> The repo name mentions Kafka; this codebase uses **RabbitMQ** (`amqplib`).

## Prerequisites

- **Node.js** (current LTS is fine)
- **MongoDB**
- **RabbitMQ**
- **FFmpeg** on your `PATH` (required by the worker for transcoding)

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Adjust values for your local MongoDB and RabbitMQ.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start **MongoDB** and **RabbitMQ** so they match `MONGODB_URI` and `RABBITMQ_URL`.

## Run

You need **two processes**: the HTTP API and the worker consumer.

**API** (default port **5000**):

```bash
npm run dev
```

**Worker** (consumes the processing queue):

```bash
npm run worker
```

For the worker with auto-restart on file changes:

```bash
npm run worker:watch
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Simple health text |
| `POST` | `/video` | Multipart field **`video`**: image or video file; optional body field **`title`**. Returns **202** when the job is queued. |
| `GET` | `/video` | List videos (newest first) |
| `GET` | `/video/:id` | Get one video by MongoDB id |

### Example upload

```bash
curl -X POST http://localhost:5000/video \
  -F "video=@/path/to/file.mp4" \
  -F "title=My clip"
```

Upload limits (see `src/middleware/fileUpload.ts`): **50 MB** max; MIME types must start with `video/` or `image/`.

### Errors

- **400** — Missing file, rejected MIME type, file too large, or other upload validation errors (JSON body).
- **202** — Upload stored and processing job accepted.
- **503** — Record created but the job could not be published to the queue (status set to `failed`).
- **500** — Unexpected failure while handling the upload.

## Project layout

- `src/index.ts` — Express app, MongoDB, RabbitMQ queue registration
- `src/worker/index.ts` — Worker entrypoint
- `src/module/video/` — Routes, controller, service, repository, Mongoose model
- `src/module/fileProcessing/` — FFmpeg `spawn` helpers
- `src/external/rabbitmq/` — Client, producer, consumer, queue registration
- `src/middleware/` — Multer upload + centralized error handler

## License

ISC (see `package.json`).
