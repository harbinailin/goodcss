"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ifVersionGte = void 0;
const assert_1 = __importDefault(require("assert"));
const semver_1 = require("semver");
const log_1 = require("../log");
function ifVersionGte(current, minimumRequiredVersion, then, otherwise) {
    (0, assert_1.default)((0, semver_1.valid)(minimumRequiredVersion), `minimumRequiredVersion argument ${minimumRequiredVersion} isn't valid`);
    if (!(0, semver_1.coerce)(current)) {
        (0, log_1.log)(`Could not parse version from "${current}", running logic for the latest GitLab version`);
        return then();
    }
    if ((0, semver_1.gte)((0, semver_1.coerce)(current), minimumRequiredVersion))
        return then();
    return otherwise();
}
exports.ifVersionGte = ifVersionGte;
//# sourceMappingURL=if_version_gte.js.map