"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LlamaEmbedApi {
    async generate(documents) {
        console.log('Indexing snippets...', 'Count: ', documents.length);
        const embeddings = await fetch("http://localhost:5000/create-embedding", {
            method: "POST",
            body: JSON.stringify({
                documents: documents
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json());
        return embeddings.result;
    }
    ;
}
exports.default = LlamaEmbedApi;
//# sourceMappingURL=llama_embed_api.js.map