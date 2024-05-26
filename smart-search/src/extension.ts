import * as vscode from 'vscode';
import { ActivityBarViewProvider } from './searchResultPanel';
import * as fs from 'fs';
import { handleInitialIndexing, indexSingleFile } from './etl/extract';
import process from 'process';
process.setMaxListeners(0);
import dotenv from 'dotenv';

dotenv.config()

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "file-explorer" is now active!');
    let disposable = vscode.commands.registerCommand('smart-search', () => {
        vscode.commands.executeCommand('workbench.view.showFileExplorerView');
    });
	const activityBarViewProvider = new ActivityBarViewProvider();
    vscode.window.registerWebviewViewProvider('showFileExplorerView', activityBarViewProvider);
    handleInitialIndexing();
    vscode.workspace.onDidSaveTextDocument(indexSingleFile);
	context.subscriptions.push(disposable);
}

export function deactivate() {
    // Cleanup
}
