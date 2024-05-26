import { extractContentsOfFile, getAstFromCode, getCodeFromAstNode } from "../parsers/ast_helpers";
import fs from 'fs';
import { loadDocumentInChroma } from "./load";


export async function indexFilesInVectorStore(filesToIndex: string[]) {
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
		await loadDocumentInChroma(document);
	}
	console.log('Inserted files in DB ', filesToIndex.length);
}