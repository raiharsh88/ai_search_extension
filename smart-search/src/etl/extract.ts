import fs from 'fs';
import { getAllFilesToBeIndexed, shouldIndexThisFile } from "../helpers/helpers";
import { extractContentsOfFile, getAstFromCode, getCodeFromAstNode } from "../parsers/ast_helpers";
import vscode from 'vscode';
import { indexFilesInVectorStore } from './transform';


export async function handleInitialIndexing(){
    try{
        const filesToBeIndex = await getAllFilesToBeIndexed();
        await indexFilesInVectorStore(filesToBeIndex);
        console.log("filesToBeIndex", filesToBeIndex);
    }catch(e){
        console.log("Error in initial codebase indexing" , e);
    }
}



export async function indexSingleFile(document: vscode.TextDocument) {
	const filePath = document.fileName;
    if (shouldIndexThisFile(filePath)){
        console.log(`File modified: ${document.fileName}`);
		indexFilesInVectorStore([filePath])
    }
}