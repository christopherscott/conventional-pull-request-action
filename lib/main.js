"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const is_semantic_message_1 = __importDefault(require("./is-semantic-message"));
function getMessage(ok, singleCommit) {
    if (!ok && singleCommit) {
        return 'Single commit message is not conventional';
    }
    else if (!ok && !singleCommit) {
        return 'PR title is not conventional';
    }
    return 'Ready to be squashed and merged';
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!process.env.GITHUB_TOKEN)
                throw 'GITHUB_TOKEN env var required';
            const { owner, repo } = github.context.repo;
            const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
            const { data } = yield octokit.repos.get({ repo, owner });
            const { allow_squash_merge, allow_merge_commit, allow_rebase_merge } = data;
            const pullRequest = github.context.payload.pull_request;
            const { title, head, number: pull_number } = pullRequest;
            const { data: items } = yield octokit.pulls.listCommits({
                owner,
                repo,
                pull_number,
            });
            const singleCommit = items.length <= 1;
            const ok = singleCommit
                ? items.every(({ commit }) => is_semantic_message_1.default(commit.message))
                : is_semantic_message_1.default(title);
            const message = getMessage(ok, singleCommit);
            const status = {
                owner,
                repo,
                sha: head.sha,
                state: ok ? 'success' : 'pending',
                description: message,
                context: 'Semantic Squash',
            };
            yield octokit.repos.createStatus(status);
        }
        catch (error) {
            console.log('err0r!', error);
        }
    });
}
run();
