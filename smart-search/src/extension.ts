import * as vscode from 'vscode';
import { ActivityBarViewProvider } from './searchResultPanel';
import * as fs from 'fs';
import { extractContentsOfFile, getAstFromCode, getCodeFromAstNode } from './parsers/ast_helpers';
import { storeCodeDocuments } from './clients/chroma';


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "file-explorer" is now active!');
    let disposable = vscode.commands.registerCommand('smart-search', () => {
        vscode.commands.executeCommand('workbench.view.showFileExplorerView');
    });
	const activityBarViewProvider = new ActivityBarViewProvider();
    vscode.window.registerWebviewViewProvider('showFileExplorerView', activityBarViewProvider);
    IndexAllFilesInVectorStore();
	context.subscriptions.push(disposable);
    vscode.workspace.onDidSaveTextDocument(indexSingleFile);
}

export function deactivate() {
    // Cleanup
}

function IndexAllFilesInVectorStore() {
	console.log('Indexing all files in workspace....');	
    // Log the contents of each file in the workspace (excluding node_modules)
    vscode.workspace.findFiles('**/*.{ts}',  '**/{node_modules,*.d.ts}/**').then(async uris => {
		const filesToIndex:string[] = []
		uris.forEach(uri => {
            const path = uri.fsPath;
			try{
				if(shouldIndexThisFile(path)){
						filesToIndex.push(path);
				}
			}catch(e){
				console.log('Error in reading file',e);
			}
        });
		await indexFilesInVectorStore(filesToIndex);
    });
}

async function indexSingleFile(document: vscode.TextDocument) {
	const filePath = document.fileName;
    if (shouldIndexThisFile(filePath)){
        console.log(`File modified: ${document.fileName} , Indexing again........`);
		indexFilesInVectorStore([filePath])
    }
}


function shouldIndexThisFile(filePath:string){
	return filePath && !filePath.includes('node_modules') && fs.existsSync(filePath)&&filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')

}
async function indexFilesInVectorStore(filesToIndex: string[]) {

	console.log('Stating to index files in ChromaDB....');
	for (const filePath of filesToIndex) {
		const ast = getAstFromCode(fs.readFileSync(filePath, 'utf-8'))
		const fileContent = extractContentsOfFile(ast);
		const document = [] as any[]
		for (const [key, value] of Object.entries(fileContent)) {
			let nodes = [] as any[];
			if (key == "unknowDeclarations") {
				nodes = value;
			} else {
				nodes = Object.values(value);
			}
			nodes.forEach(node => document.push({
				code: getCodeFromAstNode(node).code,
				url: filePath
			}))

		}
		await storeCodeDocuments(document);
	}
	console.log('Inserted files in DB ', filesToIndex.length);
}

