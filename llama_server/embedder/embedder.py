from transformers import AutoModel, AutoTokenizer
import time
checkpoint = "Salesforce/codet5p-110m-embedding"
device = "cuda"

tokenizer = AutoTokenizer.from_pretrained(checkpoint, trust_remote_code=True)
model = AutoModel.from_pretrained(checkpoint, trust_remote_code=True).to(device)

def code_to_embedding(documents):
    start = time.time()
    print('Embedding documents...')
    embeddings = [model(tokenizer.encode(doc, return_tensors="pt").to(device))[0].detach().cpu().numpy().tolist() for doc in documents]
    print('Embeddings time:', (time.time() - start)*1000 ,' ms')
    return embeddings
