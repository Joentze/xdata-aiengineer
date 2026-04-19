import asyncio
import csv
import os
import sys

import httpx

API_ENDPOINT = "http://localhost:8001"
COMMON_VOICE_DATASET_PATH = "../../common_voice"
CSV_FILENAME = "cv-valid-dev.csv"
BATCH_SIZE = 50

client = httpx.AsyncClient(base_url=API_ENDPOINT, timeout=120.0)


async def ping():
    response = await client.get("/ping")
    data = response.json()
    if data.get("message") != "pong":
        print("API ping failed, exiting.")
        sys.exit(1)
    print("API is up.")


async def transcribe(filename: str) -> tuple[str, str, str]:
    filepath = os.path.join(COMMON_VOICE_DATASET_PATH,
                            "cv-valid-dev", filename)

    with open(filepath, "rb") as f:
        files = {"file": (os.path.basename(filename), f, "audio/mpeg")}
        response = await client.post("/asr", files=files)

    response.raise_for_status()
    data = response.json()
    transcription = data["transcription"]
    duration = data["duration"]
    return filename, transcription, duration


async def main():
    await ping()

    csv_path = os.path.join(COMMON_VOICE_DATASET_PATH, CSV_FILENAME)
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    total = len(rows)
    print(f"Starting transcription of {total} files (batch_size={BATCH_SIZE})")

    result_map = {}
    for i in range(0, total, BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        tasks = [transcribe(row["filename"]) for row in batch]
        # process each task asynchronously
        results = await asyncio.gather(*tasks)

        for filename, transcription, duration in results:
            result_map[filename] = {
                "generated_text": transcription,
                "duration": duration,
            }
            truncated = (
                transcription[:50] + "...") if len(transcription) > 50 else transcription
            print(f"{len(result_map)}/{total} | {filename} | {duration}s | {truncated}")

    for row in rows:
        row["generated_text"] = result_map[row["filename"]]["generated_text"]
        row["duration"] = result_map[row["filename"]]["duration"]

    fieldnames = list(rows[0].keys())
    for fieldname in ("duration", "generated_text"):
        if fieldname not in fieldnames:
            fieldnames.append(fieldname)
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Done. Wrote generated_text and duration columns to {csv_path}")
    await client.aclose()


if __name__ == "__main__":
    asyncio.run(main())
