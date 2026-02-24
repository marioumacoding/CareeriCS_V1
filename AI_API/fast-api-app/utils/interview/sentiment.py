from ai.clients import sentiment_client

def sliding_window_chunks(text, chunk_size=20, overlap=5, min_chunk_size=10):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i : i + chunk_size]
        if len(chunk_words) < min_chunk_size and chunks:
            chunks[-1] += ' ' + ' '.join(chunk_words)
        else:
            chunks.append(' '.join(chunk_words))
        i += chunk_size - overlap
    return chunks


def polarity(emotions):
  polarity_sum = 0
  for emotion in emotions:
      if emotion['label'] == 'POSITIVE':
          polarity_sum += emotion['score']
      else:
          polarity_sum -= emotion['score']

  overall_score = polarity_sum / len(emotions)
  return overall_score


def sentiment_analysis(text):
  chunks = sliding_window_chunks(text)
 
  emotions = []
  for chunk in chunks:
    emotions.append(sentiment_client(chunk)[0])

  result = polarity(emotions)
  return result