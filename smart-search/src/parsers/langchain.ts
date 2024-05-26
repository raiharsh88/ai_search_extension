
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  answer: "answer to the user's question",
  source: "source used to answer the user's question, should be a website.",
});
const template = PromptTemplate.fromTemplate(
    "Answer the users question as best as possible.\n{format_instructions}\n{question}")

const prompt = template.format({format_instructions: parser.getFormatInstructions(), question: "What is the meaning of life?"}).then(console.log)


// const chain = RunnableSequence.from([
//   PromptTemplate.fromTemplate(
//     "Answer the users question as best as possible.\n{format_instructions}\n{question}"
//   ),
//   new OpenAI({ temperature: 0 }),
//   parser,
// ]);

console.log(prompt);