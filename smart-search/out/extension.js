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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const searchResultPanel_1 = require("./searchResultPanel");
const extract_1 = require("./etl/extract");
const process_1 = __importDefault(require("process"));
process_1.default.setMaxListeners(0);
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function activate(context) {
    console.log('Congratulations, your extension "file-explorer" is now active!');
    let disposable = vscode.commands.registerCommand('smart-search', () => {
        vscode.commands.executeCommand('workbench.view.showFileExplorerView');
    });
    const activityBarViewProvider = new searchResultPanel_1.ActivityBarViewProvider();
    vscode.window.registerWebviewViewProvider('showFileExplorerView', activityBarViewProvider);
    (0, extract_1.handleInitialIndexing)();
    vscode.workspace.onDidSaveTextDocument(extract_1.indexSingleFile);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
    // Cleanup
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map