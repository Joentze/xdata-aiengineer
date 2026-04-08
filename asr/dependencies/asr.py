from fastapi import Request, HTTPException
from transformers import AutomaticSpeechRecognitionPipeline


def get_asr_model(request: Request) -> AutomaticSpeechRecognitionPipeline:
    asr = getattr(request.app.state, "asr", None)
    if asr is None:
        raise HTTPException(
            status_code=503, detail="ASR model is not available")
    return asr
