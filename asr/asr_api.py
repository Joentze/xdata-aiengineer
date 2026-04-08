from fastapi import FastAPI, Depends
from lifespan.asr_api_lifespan import lifespan

app = FastAPI(lifespan=lifespan)
