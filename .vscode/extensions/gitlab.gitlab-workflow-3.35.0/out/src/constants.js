"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_VERSIONS = exports.README_SECTIONS = exports.FAILED_COMMENT_CONTEXT = exports.SYNCED_COMMENT_CONTEXT = exports.PATCH_FILE_SUFFIX = exports.PATCH_TITLE_PREFIX = exports.HAS_COMMENTS_QUERY_KEY = exports.CHANGE_TYPE_QUERY_KEY = exports.DO_NOT_SHOW_VERSION_WARNING = exports.MODIFIED = exports.RENAMED = exports.DELETED = exports.ADDED = exports.CONFIG_NAMESPACE = exports.REMOTE_URI_SCHEME = exports.REVIEW_URI_SCHEME = exports.GITLAB_COM_URL = void 0;
exports.GITLAB_COM_URL = 'https://gitlab.com';
exports.REVIEW_URI_SCHEME = 'gl-review';
exports.REMOTE_URI_SCHEME = 'gitlab-remote';
exports.CONFIG_NAMESPACE = 'gitlab';
exports.ADDED = 'added';
exports.DELETED = 'deleted';
exports.RENAMED = 'renamed';
exports.MODIFIED = 'modified';
exports.DO_NOT_SHOW_VERSION_WARNING = 'DO_NOT_SHOW_VERSION_WARNING';
exports.CHANGE_TYPE_QUERY_KEY = 'changeType';
exports.HAS_COMMENTS_QUERY_KEY = 'hasComments';
exports.PATCH_TITLE_PREFIX = 'patch: ';
exports.PATCH_FILE_SUFFIX = '.patch';
/** Synced comment is stored in the GitLab instance */
exports.SYNCED_COMMENT_CONTEXT = 'synced-comment';
/** Failed comment is only stored in the extension, it failed to be created in GitLab */
exports.FAILED_COMMENT_CONTEXT = 'failed-comment';
exports.README_SECTIONS = {
    SETUP: 'setup',
    REMOTEFS: 'browse-a-repository-without-cloning',
};
exports.REQUIRED_VERSIONS = {
    // NOTE: This needs to _always_ be a 3 digits
    CI_CONFIG_VALIDATIONS: '13.6.0',
    MR_DISCUSSIONS: '13.5.0',
};
//# sourceMappingURL=constants.js.map