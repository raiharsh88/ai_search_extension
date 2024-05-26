"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySnippetsFromVectorStore = exports.client = void 0;
const chromadb_1 = require("chromadb");
const chromadb_2 = require("chromadb");
const llamaEmbedder = new chromadb_2.DefaultEmbeddingFunction();
exports.client = new chromadb_1.ChromaClient({
    path: "http://localhost:8000"
});
async function querySnippetsFromVectorStore(query, collection) {
    const result = await collection.query({
        queryTexts: [query],
    });
    console.log('Total result', result);
    const formattedResult = [];
    let index = 0;
    for (const doc of result.documents[0]) {
        formattedResult.push({
            snippet: doc + "",
            filePath: { ...result.metadatas[0][index] }.url
        });
        index += 1;
    }
    return formattedResult;
}
exports.querySnippetsFromVectorStore = querySnippetsFromVectorStore;
//# sourceMappingURL=chroma.js.map