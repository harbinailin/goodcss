"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const fs_1 = require("fs");
const path = __importStar(require("path"));
const constants_1 = require("./constants");
describe('readme sections', () => {
    const headings = [];
    beforeAll(async () => {
        const readme = await fs_1.promises.readFile(path.join(__dirname, '..', 'README.md'), 'utf-8');
        readme.replace(/^#+(.*)$/gm, (s, heading) => {
            headings.push(heading.trim().toLowerCase().replace(/\W/g, '-'));
            return s;
        });
    });
    it.each(Object.values(constants_1.README_SECTIONS))('Readme contains "%s" section', (section) => {
        expect(headings).toContain(section);
    });
});
//# sourceMappingURL=constants.test.js.map