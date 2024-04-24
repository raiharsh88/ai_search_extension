import * as t from '@babel/types';

export interface SearchResult {
    filePath:string,
    snippet:string,
}


export interface FileAstContent{
    variableDeclarations:{[key:string]:t.VariableDeclaration};
    functionDeclarations:{[key:string]:t.FunctionDeclaration};
    unknowDeclarations:t.Node[];
    importDeclarations:{[key:string]:t.ImportDeclaration};
    exportDeclarations:{[key:string]:t.ExportDeclaration};
}