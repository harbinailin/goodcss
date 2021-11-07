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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const dayjs_1 = __importDefault(require("dayjs"));
const entities_1 = require("../../test_utils/entities");
const create_job_item_1 = require("./create_job_item");
const command_names_1 = require("../../command_names");
const fourYearsAgo = (0, dayjs_1.default)().subtract(4, 'year').toString();
describe('item created by createJobItem', () => {
    const jobItem = (0, create_job_item_1.createJobItem)({
        ...entities_1.job,
        name: 'unit test',
        status: 'failed',
        finished_at: fourYearsAgo,
    });
    it('has label', () => {
        expect(jobItem.label).toBe('unit test');
    });
    it('has icon', () => {
        expect(jobItem.iconPath.id).toBe('error');
    });
    it('has description', () => {
        expect(jobItem.description).toBe('Failed');
    });
    it('has tooltip', () => {
        expect(jobItem.tooltip).toBe('unit test · Failed · 4 years ago');
    });
    it('has "open in a browser" command attached to it', () => {
        var _a, _b;
        expect((_a = jobItem.command) === null || _a === void 0 ? void 0 : _a.command).toBe(command_names_1.VS_COMMANDS.OPEN);
        expect((_b = jobItem.command) === null || _b === void 0 ? void 0 : _b.arguments).toEqual([vscode.Uri.parse(entities_1.job.web_url)]);
    });
    describe('showing relative time', () => {
        const threeYearsAgo = (0, dayjs_1.default)().subtract(3, 'year').toString();
        const twoYearsAgo = (0, dayjs_1.default)().subtract(2, 'year').toString();
        const testJob = {
            ...entities_1.job,
            created_at: fourYearsAgo,
            started_at: undefined,
            finished_at: undefined,
        };
        it('uses created_at as a last resort', () => {
            expect((0, create_job_item_1.createJobItem)(testJob).tooltip).toMatch('4 years ago');
        });
        it('uses started_at over created_at', () => {
            expect((0, create_job_item_1.createJobItem)({ ...testJob, started_at: threeYearsAgo }).tooltip).toMatch('3 years ago');
        });
        it('finished_at has highest priority', () => {
            expect((0, create_job_item_1.createJobItem)({ ...testJob, finished_at: twoYearsAgo, started_at: threeYearsAgo }).tooltip).toMatch('2 years ago');
        });
    });
});
//# sourceMappingURL=create_job_item.test.js.map