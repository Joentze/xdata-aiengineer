import logging
import time
from typing import Annotated

from fastapi import FastAPI, Depends, HTTPException, UploadFile

from lifespan.asr_api_lifespan import lifespan
from dependencies.logger import get_logger
from dependencies.asr import get_asr_model
from api_models.response import PingResponse, ASRResponse
from transformers import AutomaticSpeechRecognitionPipeline

app = FastAPI(lifespan=lifespan)


@app.get("/ping", response_model=PingResponse)
def ping(logger: Annotated[logging.Logger, Depends(get_logger)]) -> PingResponse:
    logger.info("receiving ping")
    return PingResponse(message="pong")


@app.post("/asr", response_model=ASRResponse)
def asr_transcribe(file: UploadFile,
                   asr: Annotated[AutomaticSpeechRecognitionPipeline, Depends(get_asr_model)],
                   logger: Annotated[logging.Logger, Depends(get_logger)]) -> ASRResponse:
    logger.info(f"processing file {file.filename} of size {file.size}")
    if file.content_type != "audio/mpeg":
        logger.error("Unsupported file type: %s", file.content_type)
        raise HTTPException(
            status_code=415, detail=f"Unsupported file type: {file.content_type}. Expected audio file.")

    try:
        start = time.perf_counter()
        result = asr(file.file)
        duration = time.perf_counter() - start
    except Exception as e:
        logger.error("Transcription failed for %s: %s", file.filename, e)
        raise HTTPException(status_code=500, detail="Transcription failed.")

    return ASRResponse(transcription=result["text"], duration=str(round(duration, 1)))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
