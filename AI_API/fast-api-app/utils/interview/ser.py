import json
from ai.clients import ser_client

def ser(wav_path: str) -> dict:

    result = ser_client(wav_path)

    label_mapping = {
        "hap": "happy",
        "neu": "neutral",
        "sad": "sad",
        "ang": "anger",
        "fea": "fear"
    }

    formatted_output = {
        label_mapping.get(item["label"], item["label"]): 
        round(item["score"] * 100, 2)
        for item in result
    }

    return formatted_output
