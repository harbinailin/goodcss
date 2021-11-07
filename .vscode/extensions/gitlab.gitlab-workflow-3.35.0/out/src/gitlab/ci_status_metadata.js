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
exports.getPipelineMetadata = exports.getJobMetadata = void 0;
const vscode = __importStar(require("vscode"));
// colors
const successColor = 'testing.iconPassed';
const warningColor = 'problemsWarningIcon.foreground';
const errorColor = 'testing.iconErrored';
const inProgressColor = 'debugIcon.pauseForeground';
const grayColor = 'testing.iconSkipped';
const icon = (name, color) => new vscode.ThemeIcon(name, new vscode.ThemeColor(color));
const STATUS_METADATA = {
    success: { name: 'Succeeded', icon: icon('pass', successColor), priority: 1 },
    created: { name: 'Created', icon: icon('debug-pause', grayColor), priority: 3 },
    waiting_for_resource: {
        name: 'Waiting for resource',
        icon: icon('debug-pause', inProgressColor),
        priority: 4,
    },
    preparing: { name: 'Preparing', icon: icon('debug-pause', inProgressColor), priority: 5 },
    pending: { name: 'Pending', icon: icon('debug-pause', warningColor), priority: 6 },
    scheduled: { name: 'Delayed', icon: icon('clock', grayColor), priority: 7 },
    skipped: { name: 'Skipped', icon: icon('debug-step-over', grayColor), priority: 8 },
    canceled: { name: 'Cancelled', icon: icon('circle-slash', grayColor), priority: 9 },
    failed: { name: 'Failed', icon: icon('error', errorColor), priority: 10 },
    running: { name: 'Running', icon: icon('play', inProgressColor), priority: 11 },
};
const UNKNOWN_STATUS = { name: 'Status Unknown', icon: icon('question', grayColor), priority: 0 };
const FAILED_ALLOWED = {
    name: 'Failed (allowed to fail)',
    icon: icon('warning', warningColor),
    priority: 2,
};
const getJobMetadata = (job) => {
    if (job.status === 'failed' && job.allow_failure)
        return FAILED_ALLOWED;
    return STATUS_METADATA[job.status] || UNKNOWN_STATUS;
};
exports.getJobMetadata = getJobMetadata;
const getPipelineMetadata = (pipeline) => {
    return STATUS_METADATA[pipeline.status] || UNKNOWN_STATUS;
};
exports.getPipelineMetadata = getPipelineMetadata;
//# sourceMappingURL=ci_status_metadata.js.map