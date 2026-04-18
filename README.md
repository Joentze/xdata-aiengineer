## XData Assessment

### [Deployment URL](https://d57oih1077lrm.cloudfront.net/)

Search UI for Common Voice audio transcriptions.

### Architecture

- **elastic-backend** — Elasticsearch cluster and data indexing script
- **search-ui** — React search interface for querying transcriptions
- **asr** — Speech-to-text API for generating transcriptions

---

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Bun](https://bun.sh/) (for local Search UI dev)
- Python 3.12+ (for the indexing script)

---

### 1. Start Elasticsearch

```bash
cd elastic-backend

# Create the .env file (password must be "elastic" to match the indexing script and UI proxy)
echo "ELASTIC_PASSWORD=elastic" > .env

docker compose up -d
```

Wait until the cluster is healthy:

```bash
curl -u elastic:elastic http://localhost:9200/_cluster/health?pretty
```

### 2. Index the data

```bash
cd elastic-backend
poetry install
poetry run python cv_index.py
```

This reads `cv-valid-dev.csv` and bulk-indexes ~4k documents into the `cv-transcriptions` index on `localhost:9200`.

### 3. Run the Search UI


```bash
cd search-ui
bun install
bun run dev
```

The app starts at `http://localhost:3000` (default Nitro port). The Nitro server proxy forwards `/cv-transcriptions/*` requests to Elasticsearch.
