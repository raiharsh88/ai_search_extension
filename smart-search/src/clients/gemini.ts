import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import config from 'dotenv';
import { GEMINI_API_KEY } from "../creds";

config.config()
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro"}, {apiVersion: 'v1beta'});

const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        snippet: z.string(),
        filePath: z.string(),
    }).array()
);


const template = PromptTemplate.fromTemplate(
    "Return the code snippets most relevant to my input question. Return relevant results or empty array. \n{format_instructions}\n{question}\n{documents}")

export async function geminiDocumentGrader(query:string , documents:{
    snippet:string,
    filePath:string
}[]){   
    const prompt =await template.format({format_instructions: parser.getFormatInstructions(), question:query, documents:JSON.stringify(documents)})
    // const rag_prompt =  `Return the code snippets most relevant to my input query. Return each relevant results. 
    // Query: ${query}
    // Documents: ${JSON.stringify(documents)}
    // Answer:[`
    // console.log('PROMPT',rag_prompt);
    const result = await (await model.generateContent(prompt)).response.text();
    console.log('Raw gemini response' , result);

    const parsedResponse  = await getParsedResponse(result);
    console.log('Parsed response', parsedResponse);

    return parser.parse(result)
}


async function getParsedResponse(result:string){
    try{
        const res = await parser.parse(result)
        return res
    }catch(e){
        return []
    }
}
function parseDocTags(input) {
    const regex = /\[doc\]([\s\S]*?)\[\/doc\]/g;
    let match:any;2
    const results:any[] = [];

    while ((match = regex.exec(input)) !== null) {
        if (match && match.length && typeof match[0] == 'string')results.push(match[1].trim());
    } 
    return results;
}
// getParsedResponse("[No results found matching your query.]").then(console.log)
// geminiDocumentGrader("only functions that return price of all fruits at once",  [{"snippet":"export const fruit_prices = [10, 20, 30];","filePath":"/home/harsh/chat-stocks/test_app/src/helpers/helper.ts"},{"snippet":"getFruits(1);","filePath":"/home/harsh/chat-stocks/test_app/src/index.ts"},{"snippet":"console.log('Random fruit picker', fruit_names);","filePath":"/home/harsh/chat-stocks/test_app/src/fruits/banana.ts"},{"snippet":"export const random_fruit_picker = () => fruit_names[Math.floor(Math.random() * fruit_names.length)];","filePath":"/home/harsh/chat-stocks/test_app/src/helpers/helper.ts"},{"snippet":"export const fruit_names = ['apple', 'mango', 'banana'];","filePath":"/home/harsh/chat-stocks/test_app/src/helpers/helper.ts"},{"snippet":"export function getFruits(id: number) {\n  let banana: string = '';\n  let apple: string = '';\n  let mango: string = '';\n  if (id == 1) {\n    banana = getBanana();\n  } else if (id == 2) {\n    apple = appleFuncs.getApple();\n  } else if (id == 3) {\n    mango = getMango();\n  }\n  return {\n    banana,\n    apple,\n    mango,\n    time\n  };\n}","filePath":"/home/harsh/chat-stocks/test_app/src/fruit_api.ts"},{"snippet":"export function getApplePrice() {\n  return 1.99;\n}","filePath":"/home/harsh/chat-stocks/test_app/src/fruits/apple.ts"},{"snippet":"export function getBanana() {\n  console.log(random_fruit_picker());\n  return \"banana\";\n}","filePath":"/home/harsh/chat-stocks/test_app/src/fruits/banana.ts"},{"snippet":"import { getFruits } from \"./fruit_api\";","filePath":"/home/harsh/chat-stocks/test_app/src/index.ts"},{"snippet":"export function getBananaPrice() {\n  return 1.99;\n}","filePath":"/home/harsh/chat-stocks/test_app/src/fruits/banana.ts"}])


