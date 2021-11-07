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
exports.createJobItem = void 0;
const vscode = __importStar(require("vscode"));
const dayjs_1 = __importDefault(require("dayjs"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
const ci_status_metadata_1 = require("../../gitlab/ci_status_metadata");
const open_in_browser_command_1 = require("../../utils/open_in_browser_command");
dayjs_1.default.extend(relativeTime_1.default);
const createJobItem = (job) => {
    var _a, _b;
    const item = new vscode.TreeItem(job.name);
    const jobStatusMetadata = (0, ci_status_metadata_1.getJobMetadata)(job);
    const displayTime = (_b = (_a = job.finished_at) !== null && _a !== void 0 ? _a : job.started_at) !== null && _b !== void 0 ? _b : job.created_at;
    item.iconPath = jobStatusMetadata.icon;
    item.tooltip = `${job.name} · ${jobStatusMetadata.name} · ${(0, dayjs_1.default)(displayTime).fromNow()}`;
    item.description = jobStatusMetadata.name;
    item.command = (0, open_in_browser_command_1.openInBrowserCommand)(job.web_url);
    return item;
};
exports.createJobItem = createJobItem;
//# sourceMappingURL=create_job_item.js.map