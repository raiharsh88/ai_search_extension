"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySnippetsFromVectorStore = exports.storeCodeDocuments = void 0;
const chromadb_1 = require("chromadb");
const uuid_1 = require("uuid");
const chromadb_2 = require("chromadb");
const llamaEmbedder = new chromadb_2.DefaultEmbeddingFunction();
const client = new chromadb_1.ChromaClient({
    path: "http://localhost:8000"
});
const collectionName = "code_snippets_0";
let collection;
client.deleteCollection({ name: collectionName });
async function storeCodeDocuments(contents) {
    const dataToStore = {
        ids: [],
        metadatas: [],
        documents: []
    };
    contents.forEach((content, idx) => {
        dataToStore.ids.push((0, uuid_1.v4)());
        dataToStore.metadatas.push({ url: content.url });
        dataToStore.documents.push(content.code);
    });
    collection = await client.getOrCreateCollection({ name: collectionName, embeddingFunction: llamaEmbedder });
    if (!dataToStore.documents.length) {
        return;
    }
    const upsertResult = await collection.add(dataToStore);
    if (upsertResult) {
        console.log("Embeddings stored successfully");
    }
    else {
        console.log('Embedding upsert failed');
    }
}
exports.storeCodeDocuments = storeCodeDocuments;
async function querySnippetsFromVectorStore(query) {
    const result = await collection.query({
        queryTexts: [query],
    });
    console.log('Total records', (await collection.get()).documents.length, result);
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