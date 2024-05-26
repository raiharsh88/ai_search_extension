import fs from 'fs'
import * as vscode from 'vscode';

export function shouldIndexThisFile(filePath:string){
	return filePath && !filePath.includes('node_modules') && fs.existsSync(filePath)&&filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')
}

export async function getAllFilesToBeIndexed() {
	console.log('Indexing all files in workspace....');
	const filesToIndex: string[] = []
	// Log the contents of each file in the workspace (excluding node_modules)
	const fileObjects = await vscode.workspace.findFiles('**/*.{ts}', '**/{node_modules,*.d.ts}/**');

	fileObjects.forEach(uri => {
		const path = uri.fsPath;
		try {
			if (shouldIndexThisFile(path)) {
				filesToIndex.push(path);
			}
		} catch (e) {
			console.log('Error in reading file', e, "URI :", JSON.stringify(uri));
		}
	});
	return filesToIndex;
}
