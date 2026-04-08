from contextlib import asynccontextmanager
from transformers import pipeline
from fastapi import FastAPI

import logging
import torch


def get_logger() -> logging.Logger:
    """
    initialises logger
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    return logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    lifespan for asr api
    1) loads model in-memory using hugging face transformer, loads logger
    2) runs app with model accessible
    3) removes model
    """
    # states

    # create logger
    logger = get_logger()
    app.state.logger = logger
    # load model from hugging face
    logger.info("Application starting...")
    logger.info(
        "Loading in ASR model (facebook/wav2vec2-large-960h) from HuggingFace")
    try:
        if torch.cuda.is_available():
            device = "cuda"
        elif torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"
        logger.info("Using device: %s", device)
        app.state.asr = pipeline("automatic-speech-recognition",
                                 model="facebook/wav2vec2-large-960h",
                                 device=device)
    except Exception as e:
        logger.error("Failed to load ASR model: %s", e, exc_info=True)

    yield
    # cleans up model
    logger.info("Application stopping...")
    logger.info("Removing model from memory")
    del app.state.asr
