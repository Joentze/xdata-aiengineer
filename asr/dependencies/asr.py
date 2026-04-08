from dataclasses import dataclass

import torch
from fastapi import Request, HTTPException
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor


@dataclass
class ASRModel:
    model: Wav2Vec2ForCTC
    processor: Wav2Vec2Processor
    device: torch.device


def get_asr_model(request: Request) -> ASRModel:
    asr = getattr(request.app.state, "asr", None)
    processor = getattr(request.app.state, "processor", None)
    device = getattr(request.app.state, "device", None)
    if asr is None or processor is None:
        raise HTTPException(
            status_code=503, detail="ASR model is not available")
    return ASRModel(model=asr, processor=processor, device=device)
