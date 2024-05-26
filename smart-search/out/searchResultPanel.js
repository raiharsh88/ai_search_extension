"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityBarViewProvider = void 0;
const chroma_1 = require("./clients/chroma");
const gemini_1 = require("./clients/gemini");
const creds_1 = require("./creds");
const llama_embed_api_1 = __importDefault(require("./clients/llama_embed_api"));
const llamaEmbedApi = new llama_embed_api_1.default();
class ActivityBarViewProvider {
    _view;
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.js"></script>
    //<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.css" rel="stylesheet" />
    _chromaCollection;
    async resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        this._view.webview.options = {
            enableScripts: true
        };
        // Set the HTML content for the activity bar view
        this._view.webview.html = this._getHtmlContent();
        this._view.webview.onDidReceiveMessage(async (message) => {
            const searchQuery = message.searchQuery;
            if (message.command === 'searchFiles') {
                console.log('Searching for ......', searchQuery);
                const searchResults = await this.searchInFiles(searchQuery);
                console.log('Search results', searchResults);
                this._view?.webview.postMessage({ command: 'updateSearchResults', searchResults: searchResults });
            }
            else {
                console.log('Message', JSON.stringify(message, null, 2));
            }
        });
    }
    async searchInFiles(searchQuery) {
        if (!this._chromaCollection) {
            this._chromaCollection = await chroma_1.client.getCollection({ name: creds_1.CHROMA_COLLECTION_NAME, embeddingFunction: llamaEmbedApi });
        }
        const dbResults = await (0, chroma_1.querySnippetsFromVectorStore)(searchQuery, this._chromaCollection);
        return (0, gemini_1.geminiDocumentGrader)(searchQuery, dbResults);
    }
    _getHtmlContent() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
           
            <title>Activity Bar View</title>
            <style>
            .container {
                padding: 8px;
                background-color: var(--vscode-sideBar-background);
                display: flex;
                flex-direction: column;
                align-items:left;

            }
            code {
                white-space: pre-wrap; /* Preserve white spaces and line breaks */
                padding:8px;
            }
            ul{
                text-decoration:none;
                width:100%;
                padding:0px;
            }
            #searchInput {
                width: 100%;
                height: 26px;
                padding: 3px 8px;
                border: 1px solid var(--vscode-input-border);
                border-radius: 2px;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                font-size: 13px;
                outline: none;
                max-width: 100%;
                max-height:80px;
                min-width:100%;
                min-height:80px;
                margin-bottom:8px;
            }
        
            #searchInput:focus {
                border-color: var(--vscode-focusBorder);

            }

            button {
                padding: 8px 16px;
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                width:100%;
                max-width: 105%;
                min-width:105%;
            }

            li{
                margin-bottom:10px;
                text-align:left;
                width:100%;
                display:flex;
                flex-direction:column;
            }
            a{
                text-decoration: none !important;
                color: inherit !important;
                cursor: pointer !important;
                font-size: 11px;
            }
            </style>
        </head>
        <body>
            <div class="container">
                <textarea type="text" id="searchInput" placeholder="Search..."></textarea>
                <button id="searchButton">Search</button>

                <ul id="searchResults">
                </ul>
            </div>
            <script>

                let buttonTimeout;

                function setButtonState(state) {
                    const searchButton = document.getElementById('searchButton')
                      searchButton.disabled = state;
                }
                const vscode = acquireVsCodeApi();
                const searchButton = document.getElementById('searchButton')
                

              
                function clearSearchResults() {
                    const searchResultsList = document.getElementById('searchResults');
                    searchResultsList.innerHTML = '';
                }
                function updateSearchResults(searchResults) {
                    clearSearchResults();
                    const searchResultsList = document.getElementById('searchResults');

                    if(searchResults.length == 0){
                        const listElement = document.createElement('li');

                        listElement.textContent = 'No result found';

                        searchResultsList.appendChild(listElement)
                        return 
                    }
                    searchResults.forEach(result => {
                        const li = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = 'command:workbench.action.openFile?resource=' + encodeURI(result.filePath);
                        link.textContent = 'Open file';
                        const snippet = document.createElement('code');
                        snippet.textContent = result.snippet;
                        snippet.classList.add('language-typescript');
                        link.target = '_blank'; // Open link in a new tab
                        li.appendChild(link);
                        li.appendChild(snippet)
                        searchResultsList.appendChild(li);
                        setButtonState(false);
                    });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'updateSearchResults') {
                        updateSearchResults(message.searchResults);
                        // buttonTimeout?.clearTimeout()
                        document.getElementById('searchButton').textContent= 'Search'
                    } 
                });
                searchButton.addEventListener('click', (e) =>{
                    console.log('Searching')
                    clearSearchResults();
                    const searchQuery =  document.getElementById('searchInput').value;
                    vscode.postMessage({ command: 'searchFiles', searchQuery: searchQuery });
                    // setButtonState(true);
                    document.getElementById('searchButton').textContent= 'Searching.........'
                    // buttonTimeout = setTimeOut(() =>{
                    //     setButtonState(false);
                    //     document.getElementById('searchButton').textContent= 'Search'
                    // },3000)
                })
            </script>
        </body>
        </html>
        `;
    }
}
exports.ActivityBarViewProvider = ActivityBarViewProvider;
//# sourceMappingURL=searchResultPanel.js.map