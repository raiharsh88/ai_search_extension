import { ChromaClient, Collection } from 'chromadb'
import { DefaultEmbeddingFunction,OpenAIEmbeddingFunction } from 'chromadb'
import LlamaEmbedApi from './llama_embed_api'


const llamaEmbedder  = new DefaultEmbeddingFunction()



export const client = new ChromaClient({
    path: "http://localhost:8000"
});






export async function querySnippetsFromVectorStore(query:string, collection:Collection){
    const result =  await collection.query({
        queryTexts:[query],
    }) as any
    console.log('Total result' ,result)
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
