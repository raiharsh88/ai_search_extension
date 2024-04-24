import * as vscode from 'vscode';

export function createSearchView(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(
        'smart-search.searchSidebar',
        new SearchViewProvider()
    ));
}

class SearchViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    public resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        this._view = webviewView;
        this._view.webview.options = {
            enableScripts: true
        };

        // Set the HTML content for the sidebar view
        this._view.webview.html = this._getHtmlContent();
    }

    private _getHtmlContent(): string {
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
