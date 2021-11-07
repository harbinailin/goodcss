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
const pipeline_item_model_1 = require("./pipeline_item_model");
const command_names_1 = require("../../command_names");
jest.mock('../../gitlab_service');
const fourYearsAgo = (0, dayjs_1.default)().subtract(4, 'year');
describe('PipelineItemModel', () => {
    describe('tree item', () => {
        let item;
        beforeEach(() => {
            item = new pipeline_item_model_1.PipelineItemModel({
                ...entities_1.pipeline,
                id: 123,
                status: 'success',
                updated_at: fourYearsAgo.toString(),
            }, [], entities_1.repository).getTreeItem();
        });
        it('has label', () => {
            expect(item.label).toBe('Pipeline #123');
        });
        it('has tooltip', () => {
            expect(item.tooltip).toBe('Pipeline #123 · Succeeded · 4 years ago');
        });
        it('has description', () => {
            expect(item.description).toBe('Succeeded');
        });
        it('has icon', () => {
            const iconId = item.iconPath.id;
            expect(iconId).toBe('pass');
        });
        it('has "open in a browser" command attached to it', () => {
            var _a, _b;
            expect((_a = item.command) === null || _a === void 0 ? void 0 : _a.command).toBe(command_names_1.VS_COMMANDS.OPEN);
            expect((_b = item.command) === null || _b === void 0 ? void 0 : _b.arguments).toEqual([vscode.Uri.parse(entities_1.pipeline.web_url)]);
        });
    });
    describe('children', () => {
        let pipelineItem;
        const unitTestJob = { ...entities_1.job, stage: 'test', name: 'unit test' };
        const integrationTestJob = { ...entities_1.job, stage: 'test', name: 'integration test' };
        const packageJob = { ...entities_1.job, stage: 'package', name: 'package task' };
        beforeEach(() => {
            const jobs = [unitTestJob, integrationTestJob, packageJob];
            pipelineItem = new pipeline_item_model_1.PipelineItemModel(entities_1.pipeline, jobs, entities_1.repository);
        });
        it('returns unique stages', async () => {
            const children = await pipelineItem.getChildren();
            const labels = children.map(ch => ch.getTreeItem()).map(i => i.label);
            expect(labels).toEqual(['test', 'package']);
        });
        it('returns stages based on job order (asc id)', async () => {
            const jobs = [
                { ...unitTestJob, id: 3 },
                { ...integrationTestJob, id: 2 },
                { ...packageJob, id: 1 },
            ];
            pipelineItem = new pipeline_item_model_1.PipelineItemModel(entities_1.pipeline, jobs, entities_1.repository);
            const children = await pipelineItem.getChildren();
            const labels = children.map(ch => ch.getTreeItem()).map(i => i.label);
            expect(labels).toEqual(['package', 'test']);
        });
        it('passes jobs to each unique stage', async () => {
            const childrenModels = await pipelineItem.getChildren();
            const [testStageModel, packageStageModel] = childrenModels;
            const testJobItems = await testStageModel.getChildren();
            const packageJobItems = await packageStageModel.getChildren();
            expect(testJobItems.map((i) => i.label)).toEqual(['unit test', 'integration test']);
            expect(packageJobItems.map((i) => i.label)).toEqual(['package task']);
        });
    });
});
//# sourceMappingURL=pipeline_item_model.test.js.map