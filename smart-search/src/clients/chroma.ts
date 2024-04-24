import { ChromaClient, Collection } from 'chromadb'
import { v4 as uuidv4 } from 'uuid';
import { DefaultEmbeddingFunction,OpenAIEmbeddingFunction } from 'chromadb'

const llamaEmbedder  = new DefaultEmbeddingFunction()



const client = new ChromaClient({
    path: "http://localhost:8000"
});

const collectionName = "code_snippets_0"
let collection:Collection;


client.deleteCollection({name:collectionName})


export async function storeCodeDocuments(contents:any[]){
    
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

    collection = await client.getOrCreateCollection( {name:collectionName , embeddingFunction:llamaEmbedder});

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

export async function querySnippetsFromVectorStore(query:string){
    const result =  await collection.query({
        queryTexts:[query],
    }) as any
    console.log('Total records' , (await collection.get()).documents.length , result)
    const formattedResult:any[] = []
    let index = 0;
    for(const doc of result.documents[0]){
        formattedResult.push({
            snippet:doc+"",
            filePath:{...result.metadatas[0][index]}.url
        })
        index+=1;
    }

    return formattedResult
}