import path from "path";
import * as t from '@babel/types';
import * as babel from '@babel/core';
import * as parser from '@babel/parser';
import * as traverse from '@babel/traverse';
import * as babelGenerate from '@babel/generator';
import { NodePath } from "@babel/traverse";
import { FileAstContent } from "../types/interfaces";
import { CommentMode } from "vscode";


export function getCodeFromAstNode(node:any){
    return babel.transformFromAstSync(
         babel.types.file(babel.types.program([node])),
         null,
         { ast: true }
     );
 }
 
 
export function getAstFromCode(code: string) {
    try {
        const ast =  parser.parse(code, {
            errorRecovery: true,
            sourceType: 'module',
            plugins: ['typescript'],
        });

        return ast
    } catch (error) {
        return parser.parse("//xyz", {
            errorRecovery: true,
            sourceType: 'module',
            plugins: ['typescript'],
        })
    }

}


 export const IdTypes = {
    Identifier: 'Identifier',
    Literal: 'Literal',
    Pattern: 'Pattern',
    TemplateLiteral: 'TemplateLiteral',
    MemberExpression: 'MemberExpression',
    JSXIdentifier: 'JSXIdentifier',
    ArrayPattern: 'ArrayPattern',
};

export const ParentTypes = {
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    FunctionDeclaration: 'FunctionDeclaration',
}
export const NodeTypes = {
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    FunctionDeclaration: 'FunctionDeclaration',
    VariableDecalaration: 'VariableDeclaration',
    ImportDeclaration: 'ImportDeclaration',
}

export const ExportTypes = {
    ExportDefaultDeclaration: 'ExportDefaultDeclaration',
    ExportNamedDeclaration: 'ExportNamedDeclaration',
    ExportAllDeclaration: 'ExportAllDeclaration'
}

export function isParentProgram(path:NodePath<t.Node> ){
    return path.parent.type == ParentTypes.Program;
}


export function extractContentsOfFile(ast: babel.types.Node, identifiersToExtract:string[]=[]): FileAstContent {
    const variableDeclarations: { [key: string]: t.VariableDeclaration } = {}
    const unknowDeclarations = [] as t.Node[];
    const functionDeclarations: { [key: string]: t.FunctionDeclaration } = {};
    const importDeclarations: { [key: string]: t.ImportDeclaration } = {};
    const exportDeclarations: { [key: string]: t.ExportDeclaration } = {};

    traverse.default(ast, {

        // TODO : need more coverage for other data types
        VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
            if (path.parent.type == ParentTypes.Program) {
                const declarations = path.node.declarations;
                const declarationType = declarations[0].id.type;
                if (declarationType == IdTypes.ArrayPattern) {
                    const declaration: t.ArrayPattern = declarations[0].id as unknown as any;
                    for (const element of declaration.elements) {
                        if (element?.type == 'Identifier') {
                            if (identifiersToExtract.length && !identifiersToExtract.includes(element.name)) {
                                return;
                            }
                            variableDeclarations[element.name] = path.node;
                        }
                    }
                }
                else if (declarationType == 'ObjectPattern') {
                    for (const property of declarations[0].id.properties) {
                        if (property.type === 'ObjectProperty' && property.key.type == 'Identifier') {
                            if (identifiersToExtract.length && !identifiersToExtract.includes(property.key.name)) {
                                return;
                            }
                            variableDeclarations[property.key.name] = path.node;
                        }
                    }
                } else if (declarationType == 'Identifier') {
                    const declaration: t.Identifier = declarations[0].id;
                    if (identifiersToExtract.length && !identifiersToExtract.includes(declaration.name)) {
                        return;
                    }
                    variableDeclarations[declaration.name] = path.node;
                } else {
                    unknowDeclarations.push(path.node);
                }
            }
        },

        FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
            const parentType = path.parent.type;

            if (parentType == ParentTypes.Program) {
                const functionName = path.node.id?.name;
                if (functionName && identifiersToExtract.length && !identifiersToExtract.includes(functionName)) {
                    return;
                }
                if (functionName) {
                    functionDeclarations[functionName] = path.node;
                }
            }
        },

        ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
            const parentType = path.parent.type;
            if (parentType == ParentTypes.Program) {
                if (path.node.specifiers.length > 0 && path.node.specifiers[0].type === 'ImportSpecifier') {
                    path.node.specifiers.forEach(specifier => {
                        importDeclarations[specifier.local.name] = path.node;
                    });
                }
                // Default import
                else if (path.node.specifiers.length === 1 && path.node.specifiers[0].type === 'ImportDefaultSpecifier') {
                    importDeclarations[path.node.specifiers[0].local.name] = path.node;
                }
                // Namespace import
                else if (path.node.specifiers.length === 1 && path.node.specifiers[0].type === 'ImportNamespaceSpecifier') {
                    importDeclarations[path.node.specifiers[0].local.name] = path.node;
                } else {
                    unknowDeclarations.push(path.node);
                }
            }
        },
        // todo
        ExportDeclaration(path: NodePath<t.ExportDeclaration>) {
            const exportType = path.node.type;
            if (exportType == ExportTypes.ExportNamedDeclaration) {
                const exportNode = path.node as t.ExportNamedDeclaration;

                if (exportNode.specifiers) {
                    for (const specifier of exportNode.specifiers) {
                        const exported = specifier.exported as t.Identifier;
                        if (identifiersToExtract.length && !identifiersToExtract.includes(exported.name)) {
                            return;
                        }
                        exportDeclarations[exported.name] = exportNode;
                    }
                }

                if(exportNode.declaration &&  exportNode.declaration.type == NodeTypes.VariableDecalaration){
                    const declarationObject = exportNode.declaration as t.VariableDeclaration;
                    if(declarationObject?.declarations?.length){
                        const declaration = declarationObject.declarations[0] as any;
                        if(declaration && declaration?.id?.name){
                            if (identifiersToExtract.length && !identifiersToExtract.includes(declaration.id.name)) {
                                return;
                            }
                            exportDeclarations[declaration.id.name] = exportNode;
                        }
                    }
                }
                else if (exportNode.declaration) {
                    const declarationObject = exportNode.declaration as t.FunctionDeclaration;
                    if (declarationObject.id?.name && identifiersToExtract.length && !identifiersToExtract.includes(declarationObject.id?.name)) {
                        return;
                    }
                    exportDeclarations[declarationObject?.id?.name as string] = exportNode;
                }
            }else if(exportType == ExportTypes.ExportDefaultDeclaration){
                const exportNode = path.node as t.ExportDefaultDeclaration;
                const declarationObject = exportNode.declaration as t.FunctionDeclaration;
                if(declarationObject?.id?.name){
                    if (identifiersToExtract.length && !identifiersToExtract.includes(declarationObject.id.name)) {
                        return;
                    }
                    exportDeclarations[declarationObject?.id?.name as string] = exportNode;
                }else{
                    exportDeclarations['default'] = exportNode;
                }
            }else if (exportType == ExportTypes.ExportAllDeclaration ){
                const exportNode = path.node as t.ExportAllDeclaration
                exportDeclarations['*'] = exportNode;
            } else {
                unknowDeclarations.push(path.node);
            }
        },
        ExpressionStatement(path: NodePath<t.ExpressionStatement>) {
            if(isParentProgram(path)){
                unknowDeclarations.push(path.node);
            }
        },

        // Comment(path: NodePath<t.Comment>) {
        //     if(isParentProgram(path)){
        //         unknowDeclarations.push(path.node);
        //     }
        // },
        enter(path) {
            // Check if the node is a comment
            const comments = path.node.leadingComments || path.node.trailingComments;
            if (comments) {
                // comments.forEach(comment => {
                    // unknowDeclarations.push(comment);
                // });
                unknowDeclarations.push(path.node);
            }
        }
    });

    return {
        exportDeclarations,
        variableDeclarations,
        functionDeclarations,
        unknowDeclarations,
        importDeclarations
    };
}



export function getIdentifiersFromAst(ast:any){

    const identifiers = [] as string[]
    traverse.default(ast, {
        Identifier(path:NodePath<t.Identifier>) {
            identifiers.push(path.node.name)
        }
    })

    return identifiers; 
}