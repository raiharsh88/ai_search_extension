"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsertableDocumentFromCode = void 0;
const gpt_tokenizer_1 = require("gpt-tokenizer");
const tokens = (0, gpt_tokenizer_1.encode)("const a = 1");
function getInsertableDocumentFromCode(contents) {
    for (const content of contents) {
        const { code, url } = content;
    }
    return contents;
}
exports.getInsertableDocumentFromCode = getInsertableDocumentFromCode;
//# sourceMappingURL=embedding.js.map