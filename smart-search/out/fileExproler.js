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
exports.TreeNode = exports.MyTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
class MyTreeDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    _data;
    constructor() {
        this._data = []; // Initialize with empty data
    }
    // Implement methods for providing tree items
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            // Return children of the element
            return Promise.resolve(element.children);
        }
        else {
            // Return root elements
            return Promise.resolve(this._data);
        }
    }
    // Method for refreshing the tree view
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    // Method for setting new data for the tree view
    setData(data) {
        this._data = data;
        this.refresh();
    }
    _getHtmlContent() {
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
exports.MyTreeDataProvider = MyTreeDataProvider;
class TreeNode extends vscode.TreeItem {
    label;
    children;
    collapsibleState;
    constructor(label, children = [], collapsibleState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(label, collapsibleState);
        this.label = label;
        this.children = children;
        this.collapsibleState = collapsibleState;
    }
}
exports.TreeNode = TreeNode;
//# sourceMappingURL=fileExproler.js.map