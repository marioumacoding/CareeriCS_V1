from ai.clients import *

def qwen_response(prompt):
    completion = qwen_client.chat.completions.create(
        model="Qwen/Qwen2.5-1.5B-Instruct:featherless-ai",
        messages=[{"role": "user", "content": prompt}],
    )
    raw_text = completion.choices[0].message.content.strip()
    return raw_text


def deepseek_response(prompt):
    response = DS_Client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.2:novita",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    raw_text = response.choices[0].message.content
    return raw_text


def transcribe(file_path: str) -> str:
    transcription = whisper_client.automatic_speech_recognition(
        file_path,
        model="openai/whisper-large-v3-turbo"
    )
    return transcription['text']