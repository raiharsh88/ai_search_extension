import * as vscode from 'vscode';

export class MyTreeDataProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

    private _data: TreeNode[];

    constructor() {
        this._data = []; // Initialize with empty data
    }

    // Implement methods for providing tree items
    getTreeItem(element: TreeNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNode): Thenable<TreeNode[]> {
        if (element) {
            // Return children of the element
            return Promise.resolve(element.children);
        } else {
            // Return root elements
            return Promise.resolve(this._data);
        }
    }

    // Method for refreshing the tree view
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    // Method for setting new data for the tree view
    setData(data: TreeNode[]): void {
        this._data = data;
        this.refresh();
    }
    
    private _getHtmlContent(): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Explorer</title>
            <style>
                .container {
                    padding: 20px;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 5px;
                }
                li.directory {
                    font-weight: bold;
                }
                li.file {
                    margin-left: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>File Explorer</h2>
                <ul id="fileList">
                    <!-- File and directory items will be dynamically added here -->
                </ul>
            </div>
        </body>
        </html>
        `;
    }
}

export class TreeNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly children: TreeNode[] = [],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    ) {
        super(label, collapsibleState);
    }
}