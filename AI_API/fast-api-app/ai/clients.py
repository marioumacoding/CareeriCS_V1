import os
from openai import OpenAI
from dotenv import load_dotenv
from transformers import pipeline
from huggingface_hub import InferenceClient

DS_TOKEN = os.getenv("DS_TOKEN")
HF_TOKEN = os.getenv("HF_TOKEN")

DS_Client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=DS_TOKEN,
)

minimax_client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)

whisper_client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN,
)

ser_client = pipeline(
    "audio-classification",
    model="superb/hubert-large-superb-er"
)

sentiment_client = pipeline("sentiment-analysis")