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
exports.getIdentifiersFromAst = exports.extractContentsOfFile = exports.isParentProgram = exports.ExportTypes = exports.NodeTypes = exports.ParentTypes = exports.IdTypes = exports.getAstFromCode = exports.getCodeFromAstNode = void 0;
const babel = __importStar(require("@babel/core"));
const parser = __importStar(require("@babel/parser"));
const traverse = __importStar(require("@babel/traverse"));
function getCodeFromAstNode(node) {
    return babel.transformFromAstSync(babel.types.file(babel.types.program([node])), null, { ast: true });
}
exports.getCodeFromAstNode = getCodeFromAstNode;
function getAstFromCode(code) {
    try {
        const ast = parser.parse(code, {
            errorRecovery: true,
            sourceType: 'module',
            plugins: ['typescript'],
        });
        return ast;
    }
    catch (error) {
        return parser.parse("//xyz", {
            errorRecovery: true,
            sourceType: 'module',
            plugins: ['typescript'],
        });
    }
}
exports.getAstFromCode = getAstFromCode;
exports.IdTypes = {
    Identifier: 'Identifier',
    Literal: 'Literal',
    Pattern: 'Pattern',
    TemplateLiteral: 'TemplateLiteral',
    MemberExpression: 'MemberExpression',
    JSXIdentifier: 'JSXIdentifier',
    ArrayPattern: 'ArrayPattern',
};
exports.ParentTypes = {
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    FunctionDeclaration: 'FunctionDeclaration',
};
exports.NodeTypes = {
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    FunctionDeclaration: 'FunctionDeclaration',
    VariableDecalaration: 'VariableDeclaration',
    ImportDeclaration: 'ImportDeclaration',
};
exports.ExportTypes = {
    ExportDefaultDeclaration: 'ExportDefaultDeclaration',
    ExportNamedDeclaration: 'ExportNamedDeclaration',
    ExportAllDeclaration: 'ExportAllDeclaration'
};
function isParentProgram(path) {
    return path.parent.type == exports.ParentTypes.Program;
}
exports.isParentProgram = isParentProgram;
function extractContentsOfFile(ast, identifiersToExtract = []) {
    const variableDeclarations = {};
    const unknowDeclarations = [];
    const functionDeclarations = {};
    const importDeclarations = {};
    const exportDeclarations = {};
    traverse.default(ast, {
        // TODO : need more coverage for other data types
        VariableDeclaration(path) {
            if (path.parent.type == exports.ParentTypes.Program) {
                const declarations = path.node.declarations;
                const declarationType = declarations[0].id.type;
                if (declarationType == exports.IdTypes.ArrayPattern) {
                    const declaration = declarations[0].id;
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
                }
                else if (declarationType == 'Identifier') {
                    const declaration = declarations[0].id;
                    if (identifiersToExtract.length && !identifiersToExtract.includes(declaration.name)) {
                        return;
                    }
                    variableDeclarations[declaration.name] = path.node;
                }
                else {
                    unknowDeclarations.push(path.node);
                }
            }
        },
        FunctionDeclaration(path) {
            const parentType = path.parent.type;
            if (parentType == exports.ParentTypes.Program) {
                const functionName = path.node.id?.name;
                if (functionName && identifiersToExtract.length && !identifiersToExtract.includes(functionName)) {
                    return;
                }
                if (functionName) {
                    functionDeclarations[functionName] = path.node;
                }
            }
        },
        ImportDeclaration(path) {
            const parentType = path.parent.type;
            if (parentType == exports.ParentTypes.Program) {
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
                }
                else {
                    unknowDeclarations.push(path.node);
                }
            }
        },
        // todo
        ExportDeclaration(path) {
            const exportType = path.node.type;
            if (exportType == exports.ExportTypes.ExportNamedDeclaration) {
                const exportNode = path.node;
                if (exportNode.specifiers) {
                    for (const specifier of exportNode.specifiers) {
                        const exported = specifier.exported;
                        if (identifiersToExtract.length && !identifiersToExtract.includes(exported.name)) {
                            return;
                        }
                        exportDeclarations[exported.name] = exportNode;
                    }
                }
                if (exportNode.declaration && exportNode.declaration.type == exports.NodeTypes.VariableDecalaration) {
                    const declarationObject = exportNode.declaration;
                    if (declarationObject?.declarations?.length) {
                        const declaration = declarationObject.declarations[0];
                        if (declaration && declaration?.id?.name) {
                            if (identifiersToExtract.length && !identifiersToExtract.includes(declaration.id.name)) {
                                return;
                            }
                            exportDeclarations[declaration.id.name] = exportNode;
                        }
                    }
                }
                else if (exportNode.declaration) {
                    const declarationObject = exportNode.declaration;
                    if (declarationObject.id?.name && identifiersToExtract.length && !identifiersToExtract.includes(declarationObject.id?.name)) {
                        return;
                    }
                    exportDeclarations[declarationObject?.id?.name] = exportNode;
                }
            }
            else if (exportType == exports.ExportTypes.ExportDefaultDeclaration) {
                const exportNode = path.node;
                const declarationObject = exportNode.declaration;
                if (declarationObject?.id?.name) {
                    if (identifiersToExtract.length && !identifiersToExtract.includes(declarationObject.id.name)) {
                        return;
                    }
                    exportDeclarations[declarationObject?.id?.name] = exportNode;
                }
                else {
                    exportDeclarations['default'] = exportNode;
                }
            }
            else if (exportType == exports.ExportTypes.ExportAllDeclaration) {
                const exportNode = path.node;
                exportDeclarations['*'] = exportNode;
            }
            else {
                unknowDeclarations.push(path.node);
            }
        },
        ExpressionStatement(path) {
            if (isParentProgram(path)) {
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
exports.extractContentsOfFile = extractContentsOfFile;
function getIdentifiersFromAst(ast) {
    const identifiers = [];
    traverse.default(ast, {
        Identifier(path) {
            identifiers.push(path.node.name);
        }
    });
    return identifiers;
}
exports.getIdentifiersFromAst = getIdentifiersFromAst;
//# sourceMappingURL=ast_helpers.js.map