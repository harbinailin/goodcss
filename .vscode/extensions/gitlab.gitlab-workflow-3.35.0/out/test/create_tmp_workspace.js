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
const temp = __importStar(require("temp"));
const simple_git_1 = __importDefault(require("simple-git"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const constants_1 = require("./integration/test_infrastructure/constants");
async function createTempFolder() {
    return new Promise((resolve, reject) => {
        temp.mkdir('vscodeWorkplace', (err, dirPath) => {
            if (err)
                reject(err);
            resolve(dirPath);
        });
    });
}
async function addFile(folderPath, relativePath, content) {
    const fullPath = path.join(folderPath, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(fullPath, content);
}
const isMac = () => Boolean(process.platform.match(/darwin/));
// `autoCleanUp = true` means that the directory gets deleted on process exit
async function createTmpWorkspace(autoCleanUp = true) {
    if (autoCleanUp)
        temp.track();
    const dirPath = await createTempFolder();
    const git = (0, simple_git_1.default)(dirPath, { binary: 'git' });
    await git.init();
    await git.addRemote(constants_1.REMOTE.NAME, constants_1.REMOTE.URL);
    await git.addConfig('user.email', 'test@example.com');
    await git.addConfig('user.name', 'Test Name');
    await git.commit('Test commit', [], {
        '--allow-empty': null,
    });
    await addFile(dirPath, '/.vscode/settings.json', JSON.stringify(constants_1.DEFAULT_VS_CODE_SETTINGS));
    // on mac, the temp node module creates folder in /var. /var is a symlink
    // to /private/var on mac. Every time we use git, it returns the non-symlinked /private prefixed path
    // https://apple.stackexchange.com/questions/1043/why-is-tmp-a-symlink-to-private-tmp/1096
    // this prefixing brings the git results in sync with the rest of the tests
    return isMac() ? `/private${dirPath}` : dirPath;
}
exports.default = createTmpWorkspace;
//# sourceMappingURL=create_tmp_workspace.js.map