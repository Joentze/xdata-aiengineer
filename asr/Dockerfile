FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir poetry poetry-plugin-export

COPY pyproject.toml poetry.lock ./

# removes nvidia cuda dependencies for docker (too large)
RUN poetry config virtualenvs.create false && \
    poetry export -f requirements.txt -o requirements.txt --without-hashes && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    grep -v -E "^(torch==|nvidia-|triton)" requirements.txt > requirements-cpu.txt && \
    pip install --no-cache-dir -r requirements-cpu.txt && \
    rm requirements.txt requirements-cpu.txt && \
    pip uninstall -y poetry

COPY . .

EXPOSE 8001

CMD ["python", "asr_api.py"]
