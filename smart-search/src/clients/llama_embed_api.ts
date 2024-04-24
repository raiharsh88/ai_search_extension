import { IEmbeddingFunction } from "chromadb";

export default class LlamaEmbedApi {

    async generate(texts: string[]):Promise<any[]>{
        console.log('Texts' ,texts.length)
        const embeddings = await fetch("http://localhost:5000/code_to_embedding", {
            method: "POST",
            body: JSON.stringify({
                query: texts
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json());
        console.log('RES',embeddings.result.map(r => r));
        return embeddings.result
    };
}