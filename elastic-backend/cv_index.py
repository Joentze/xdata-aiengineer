from enum import verify
import os
from csv import DictReader
from pathlib import Path
from elasticsearch import Elasticsearch, helpers


ELASTICSEARCH_URL = "http://localhost:9200"
INDEX_NAME = "cv-transcriptions"
CSV_PATH = Path("cv-valid-dev.csv")
BATCH_SIZE = 500


def to_doc(row: dict) -> dict:
    return {
        "filename": row["filename"],
        "generated_text": row["generated_text"],
        "duration": float(row["duration"]) if row["duration"] else None,
        "age": row["age"] or None,
        "gender": row["gender"] or None,
        "accent": row["accent"] or None,
    }


def actions():
    with CSV_PATH.open(newline="", encoding="utf-8") as file_obj:
        reader = DictReader(file_obj)
        for row in reader:
            yield {
                "_index": INDEX_NAME,
                "_id": row["filename"],
                "_source": to_doc(row),
            }


def main():
    client = Elasticsearch(hosts=[ELASTICSEARCH_URL],
                           basic_auth=('elastic', "elastic"),
                           verify_certs=False,
                           max_retries=30,
                           retry_on_timeout=True,
                           request_timeout=30,
                           )

    if not client.indices.exists(index=INDEX_NAME):
        client.indices.create(
            index=INDEX_NAME,
            mappings={
                "properties": {
                    "filename": {"type": "keyword"},
                    "generated_text": {
                        "type": "text",
                        "fields": {"raw": {"type": "keyword"}},
                    },
                    "duration": {"type": "float"},
                    "age": {"type": "keyword"},
                    "gender": {"type": "keyword"},
                    "accent": {"type": "keyword"},
                }
            },
        )

    helpers.bulk(client, actions(), chunk_size=BATCH_SIZE, request_timeout=60)


if __name__ == "__main__":
    main()
