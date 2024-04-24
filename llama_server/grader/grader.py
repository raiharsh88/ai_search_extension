from langchain.prompts import PromptTemplate
from llama_cpp import Llama
import time
import json
import os


# check langchain docs to get more info about how to use langchain and llamacpp
# download the model from huggingface ,i have used - codellama-7b-instruct.Q8_0.gguf"
model_path = os.getenv("MODEL_PATH")

model = Llama(model_path=model_path ,chat_format='llama-2' ,n_ctx=4096 , n_gpu_layers=-1)


def grade_documents(query , documents):
        rawTemplate = '''
            <s>[INST]
            <<SYS>>
            You are an assistant required to filter out non relevant snippets and sort the results in descreasing order of relevance based on the following query (Query: {query}) and provided code snippets (Code snippets:{documents}).
            <</SYS>>
            [/INST]
            Filtered snippets are:['''
        template =                                                                                                                                                                                                                                                                           PromptTemplate(
            input_variables=["query" ,"documents"],
            template=rawTemplate
        )
        formattedPrompt = template.format(query=query ,documents=json.dumps(documents))+''
        start = time.time()
        model.reset()
        results = model(
                formattedPrompt,
                max_tokens=2000,
                stop=["]"],echo=False,temperature=0)
        outputCode = results["choices"][0]['text']

        print( 'Usage Specs',results['usage'])
        print('Time taken', time.time()-start)
        print('Output code', json.loads(f'[{outputCode.strip()}]'))
        return json.loads(f'[{outputCode.strip()}]')
