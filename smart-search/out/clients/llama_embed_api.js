"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LlamaEmbedApi {
    async generate(texts) {
        console.log('Texts', texts.length);
        const embeddings = await fetch("http://localhost:5000/code_to_embedding", {
            method: "POST",
            body: JSON.stringify({
                query: texts
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json());
        console.log('RES', embeddings.result.map(r => r));
        return embeddings.result;
    }
    ;
}
exports.default = LlamaEmbedApi;
//# sourceMappingURL=llama_embed_api.js.map