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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const searchResultPanel_1 = require("./searchResultPanel");
const fs = __importStar(require("fs"));
const ast_helpers_1 = require("./parsers/ast_helpers");
const chroma_1 = require("./clients/chroma");
function activate(context) {
    console.log('Congratulations, your extension "file-explorer" is now active!');
    let disposable = vscode.commands.registerCommand('smart-search', () => {
        vscode.commands.executeCommand('workbench.view.showFileExplorerView');
    });
    const activityBarViewProvider = new searchResultPanel_1.ActivityBarViewProvider();
    vscode.window.registerWebviewViewProvider('showFileExplorerView', activityBarViewProvider);
    IndexAllFilesInVectorStore();
    context.subscriptions.push(disposable);
    vscode.workspace.onDidSaveTextDocument(indexSingleFile);
}
exports.activate = activate;
function deactivate() {
    // Cleanup
}
exports.deactivate = deactivate;
function IndexAllFilesInVectorStore() {
    console.log('Indexing all files in workspace....');
    // Log the contents of each file in the workspace (excluding node_modules)
    vscode.workspace.findFiles('**/*.{ts}', '**/{node_modules,*.d.ts}/**').then(async (uris) => {
        const filesToIndex = [];
        uris.forEach(uri => {
            const path = uri.fsPath;
            try {
                if (shouldIndexThisFile(path)) {
                    filesToIndex.push(path);
                }
            }
            catch (e) {
                console.log('Error in reading file', e);
            }
        });
        await indexFilesInVectorStore(filesToIndex);
    });
}
async function indexSingleFile(document) {
    const filePath = document.fileName;
    if (shouldIndexThisFile(filePath)) {
        console.log(`File modified: ${document.fileName} , Indexing again........`);
        indexFilesInVectorStore([filePath]);
    }
}
function shouldIndexThisFile(filePath) {
    return filePath && !filePath.includes('node_modules') && fs.existsSync(filePath) && filePath.endsWith('.ts') && !filePath.endsWith('.d.ts');
}
async function indexFilesInVectorStore(filesToIndex) {
    console.log('Stating to index files in ChromaDB....');
    for (const filePath of filesToIndex) {
        const ast = (0, ast_helpers_1.getAstFromCode)(fs.readFileSync(filePath, 'utf-8'));
        const fileContent = (0, ast_helpers_1.extractContentsOfFile)(ast);
        const document = [];
        for (const [key, value] of Object.entries(fileContent)) {
            let nodes = [];
            if (key == "unknowDeclarations") {
                nodes = value;
            }
            else {
                nodes = Object.values(value);
            }
            nodes.forEach(node => document.push({
                code: (0, ast_helpers_1.getCodeFromAstNode)(node).code,
                url: filePath
            }));
        }
        await (0, chroma_1.storeCodeDocuments)(document);
    }
    console.log('Inserted files in DB ', filesToIndex.length);
}
//# sourceMappingURL=extension.js.map