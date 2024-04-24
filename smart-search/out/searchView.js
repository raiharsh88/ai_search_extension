"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchView = void 0;
const vscode = __importStar(require("vscode"));
function createSearchView(context) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('smart-search.searchSidebar', new SearchViewProvider()));
}
exports.createSearchView = createSearchView;
class SearchViewProvider {
    _view;
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        this._view.webview.options = {
            enableScripts: true
        };
        // Set the HTML content for the sidebar view
        this._view.webview.html = this._getHtmlContent();
    }
    _getHtmlContent() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Search</title>
            <style>
                .container {
                    padding: 20px;
                }
                input[type="text"] {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                button {
                    padding: 8px 16px;
                    background-color: #007acc;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <input type="text" id="searchInput" placeholder="Enter keyword to search">
                <button id="searchButton">Search</button>
            </div>
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('searchButton').addEventListener('click', () => {
                    const keyword = document.getElementById('searchInput').value;
                    vscode.postMessage({ command: 'search', keyword: keyword });
                });
            </script>
        </body>
        </html>
        `;
    }
}
//# sourceMappingURL=searchView.js.map