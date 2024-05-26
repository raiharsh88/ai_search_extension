import { IEmbeddingFunction } from "chromadb";

export default class LlamaEmbedApi {
    async generate(documents: string[]):Promise<any[]>{
        console.log('Indexing snippets...', 'Count: ',documents.length)
        const embeddings = await fetch("http://localhost:5000/create-embedding", {
            method: "POST",
            body: JSON.stringify({
                documents:documents
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json());
        return embeddings.result
    };
}