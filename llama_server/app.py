from flask import Flask, request, jsonify
from dotenv import load_dotenv
load_dotenv()

# from grader.grader import grade_documents
from embedder import code_to_embedding
app = Flask(__name__)

def process_query(query):
    processed_result = query.upper()
    return processed_result



@app.route('/document_grader', methods=['POST'])
def handle_document_grading():
    data = request.get_json()
    query = data.get('searchQuery')
    documents = data.get('documents')
    print('Query', len(query))
    if not query:
        return jsonify({'error': 'Query not provided'}), 400

    # processed_result = grade_documents(query, documents)
    # print('Processed' , len(processed_result))
    # return jsonify({'result': processed_result})

@app.route('/create-embedding', methods=['POST'])
def handle_embedding():
    print('Received request')
    data = request.get_json()
    documents = data.get('documents')
    processed_result = code_to_embedding(documents=documents)
    print('Processed', len(processed_result))
    return jsonify({'result': processed_result})
if __name__ == '__main__':
    app.run(debug=False)


