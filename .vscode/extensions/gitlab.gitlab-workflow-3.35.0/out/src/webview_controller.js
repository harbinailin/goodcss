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
exports.webviewController = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const gitLabService = __importStar(require("./gitlab_service"));
const service_factory_1 = require("./service_factory");
const log_1 = require("./log");
const get_instance_url_1 = require("./utils/get_instance_url");
const is_mr_1 = require("./utils/is_mr");
const make_html_links_absolute_1 = require("./utils/make_html_links_absolute");
const webviewResourcePaths = {
    appScriptUri: 'src/webview/dist/js/app.js',
    vendorUri: 'src/webview/dist/js/chunk-vendors.js',
    styleUri: 'src/webview/dist/css/app.css',
    devScriptUri: 'src/webview/dist/app.js',
};
async function initPanelIfActive(panel, issuable, repositoryRoot) {
    if (!panel.active)
        return;
    const appReadyPromise = new Promise(resolve => {
        const sub = panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'appReady') {
                sub.dispose();
                resolve();
            }
        });
    });
    const gitlabNewService = await (0, service_factory_1.createGitLabNewService)(repositoryRoot);
    const discussionsAndLabels = await gitlabNewService
        .getDiscussionsAndLabelEvents(issuable)
        .catch(e => {
        (0, log_1.handleError)(e);
        return [];
    });
    await appReadyPromise;
    await panel.webview.postMessage({
        type: 'issuableFetch',
        issuable,
        discussions: discussionsAndLabels,
    });
}
class WebviewController {
    constructor() {
        this.isDev = false;
        this.openedPanels = {};
        this.createMessageHandler = (panel, issuable, repositoryRoot) => async (message) => {
            const instanceUrl = await (0, get_instance_url_1.getInstanceUrl)(repositoryRoot);
            if (message.command === 'renderMarkdown') {
                let rendered = await gitLabService.renderMarkdown(message.markdown, repositoryRoot);
                rendered = (0, make_html_links_absolute_1.makeHtmlLinksAbsolute)(rendered || '', instanceUrl);
                await panel.webview.postMessage({
                    type: 'markdownRendered',
                    ref: message.ref,
                    object: message.object,
                    markdown: rendered,
                });
            }
            if (message.command === 'saveNote') {
                const gitlabNewService = await (0, service_factory_1.createGitLabNewService)(repositoryRoot);
                try {
                    await gitlabNewService.createNote(issuable, message.note, message.replyId);
                    const discussionsAndLabels = await gitlabNewService.getDiscussionsAndLabelEvents(issuable);
                    await panel.webview.postMessage({
                        type: 'issuableFetch',
                        issuable,
                        discussions: discussionsAndLabels,
                    });
                    await panel.webview.postMessage({ type: 'noteSaved' });
                }
                catch (e) {
                    (0, log_1.logError)(e);
                    await panel.webview.postMessage({ type: 'noteSaved', status: false });
                }
            }
        };
    }
    init(context, isDev) {
        this.context = context;
        this.isDev = isDev;
    }
    getResources(panel) {
        return Object.entries(webviewResourcePaths).reduce((acc, [key, value]) => {
            (0, assert_1.default)(this.context);
            const uri = vscode.Uri.file(path.join(this.context.extensionPath, value));
            return { ...acc, [key]: panel.webview.asWebviewUri(uri) };
        }, {});
    }
    getIndexPath() {
        return this.isDev ? 'src/webview/public/dev.html' : 'src/webview/public/index.html';
    }
    replaceResources(panel) {
        (0, assert_1.default)(this.context);
        const { appScriptUri, vendorUri, styleUri, devScriptUri } = this.getResources(panel);
        const nonce = crypto.randomBytes(20).toString('hex');
        return fs
            .readFileSync(path.join(this.context.extensionPath, this.getIndexPath()), 'UTF-8')
            .replace(/{{nonce}}/gm, nonce)
            .replace('{{styleUri}}', styleUri.toString())
            .replace('{{vendorUri}}', vendorUri.toString())
            .replace('{{appScriptUri}}', appScriptUri.toString())
            .replace('{{devScriptUri}}', devScriptUri.toString());
    }
    createPanel(issuable) {
        (0, assert_1.default)(this.context);
        const title = `${issuable.title.slice(0, 20)}...`;
        return vscode.window.createWebviewPanel('glWorkflow', title, vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'src'))],
            retainContextWhenHidden: true,
        });
    }
    getIconPathForIssuable(issuable) {
        const getIconUri = (shade, file) => vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'assets', 'images', shade, file));
        const lightIssueIcon = getIconUri('light', 'issues.svg');
        const lightMrIcon = getIconUri('light', 'merge_requests.svg');
        const darkIssueIcon = getIconUri('dark', 'issues.svg');
        const darkMrIcon = getIconUri('dark', 'merge_requests.svg');
        return (0, is_mr_1.isMr)(issuable)
            ? { light: lightMrIcon, dark: darkMrIcon }
            : { light: lightIssueIcon, dark: darkIssueIcon };
    }
    async open(issuable, repositoryRoot) {
        const panelKey = `${repositoryRoot}-${issuable.id}`;
        const openedPanel = this.openedPanels[panelKey];
        if (openedPanel) {
            openedPanel.reveal();
            return openedPanel;
        }
        const newPanel = await this.create(issuable, repositoryRoot);
        this.openedPanels[panelKey] = newPanel;
        newPanel.onDidDispose(() => {
            this.openedPanels[panelKey] = undefined;
        });
        return newPanel;
    }
    async create(issuable, repositoryRoot) {
        (0, assert_1.default)(this.context);
        const panel = this.createPanel(issuable);
        const html = this.replaceResources(panel);
        panel.webview.html = html;
        panel.iconPath = this.getIconPathForIssuable(issuable);
        await initPanelIfActive(panel, issuable, repositoryRoot);
        panel.onDidChangeViewState(async () => {
            await initPanelIfActive(panel, issuable, repositoryRoot);
        });
        panel.webview.onDidReceiveMessage(this.createMessageHandler(panel, issuable, repositoryRoot));
        return panel;
    }
}
exports.webviewController = new WebviewController();
//# sourceMappingURL=webview_controller.js.map