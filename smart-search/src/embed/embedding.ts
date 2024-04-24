import {
    encode,
    encodeChat,
    decode,
    isWithinTokenLimit,
    encodeGenerator,
    decodeGenerator,
    decodeAsyncGenerator,
  } from 'gpt-tokenizer'

const tokens = encode("const a = 1")
 


export function getInsertableDocumentFromCode(contents:any[]){
    for(const content of contents){
    const {code,url} = content
    }
    return contents
}