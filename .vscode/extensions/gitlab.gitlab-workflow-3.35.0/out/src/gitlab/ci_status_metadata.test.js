"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("../test_utils/entities");
const ci_status_metadata_1 = require("./ci_status_metadata");
describe('CI Status Metadata', () => {
    describe('getJobMetadata', () => {
        it('gets metadata', () => {
            const result = (0, ci_status_metadata_1.getJobMetadata)(entities_1.job);
            expect(result.icon.id).toBe('pass');
            expect(result.name).toBe('Succeeded');
        });
        it('creates failed (allowed to fail) metadata', () => {
            const result = (0, ci_status_metadata_1.getJobMetadata)({ ...entities_1.job, allow_failure: true, status: 'failed' });
            expect(result.icon.id).toBe('warning');
            expect(result.name).toBe('Failed (allowed to fail)');
        });
        it('returns unknown metadata for unknown status', () => {
            const result = (0, ci_status_metadata_1.getJobMetadata)({
                ...entities_1.job,
                status: 'unknown',
            });
            expect(result.icon.id).toBe('question');
            expect(result.name).toBe('Status Unknown');
        });
        it('returns "Delayed" for a scheduled job', () => {
            const result = (0, ci_status_metadata_1.getJobMetadata)({
                ...entities_1.job,
                status: 'scheduled',
            });
            expect(result.icon.id).toBe('clock');
            expect(result.name).toBe('Delayed');
        });
    });
    describe('getPipelineMetadata', () => {
        it('gets metadata', () => {
            const result = (0, ci_status_metadata_1.getPipelineMetadata)(entities_1.pipeline);
            expect(result.icon.id).toBe('pass');
            expect(result.name).toBe('Succeeded');
        });
        it('returns unknown metadata for unknown status', () => {
            const result = (0, ci_status_metadata_1.getPipelineMetadata)({
                ...entities_1.pipeline,
                status: 'unknown',
            });
            expect(result.icon.id).toBe('question');
            expect(result.name).toBe('Status Unknown');
        });
    });
});
//# sourceMappingURL=ci_status_metadata.test.js.map