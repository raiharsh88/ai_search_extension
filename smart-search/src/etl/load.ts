import { ChromaClient, Collection } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { client } from '../clients/chroma';
import LlamaEmbedApi from '../clients/llama_embed_api';
import { CHROMA_COLLECTION_NAME } from '../creds';
const llamaEmbedApi = new LlamaEmbedApi();

export async function loadDocumentInChroma(document:any){
    await storeCodeDocuments(document);
}

let collection :Collection;

// delete the collection on reactivation of app
client.deleteCollection({name:CHROMA_COLLECTION_NAME})

async function storeCodeDocuments(contents:any[]){
    const dataToStore = {
        ids:[] as string[],
        metadatas:[] as any[],
        documents:[] as string[]
    }

    contents.forEach((content,idx) => {
        dataToStore.ids.push(uuidv4());
        dataToStore.metadatas.push({url:content.url});
        dataToStore.documents.push(content.code);
    }) 

    collection = await client.getOrCreateCollection( {name:CHROMA_COLLECTION_NAME , embeddingFunction:llamaEmbedApi});

    if(!dataToStore.documents.length){
        return;
    }

    const upsertResult = await collection.add(dataToStore)
    if(upsertResult){
        console.log("Embeddings stored successfully");
    }else{
        console.log('Embedding upsert failed')
    }
}

