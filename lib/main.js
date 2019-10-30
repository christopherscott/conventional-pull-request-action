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
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!process.env.GITHUB_TOKEN)
                throw 'GITHUB_TOKEN env var required';
            const { owner, repo } = github.context.repo;
            const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
            const { data } = yield octokit.repos.get({ repo, owner });
            const { allow_squash_merge, allow_merge_commit, allow_rebase_merge } = data;
            const { title, head, number } = github.context.payload.pull_request;
            const commits = yield octokit.pulls.listCommits({
                owner,
                repo,
                pull_number: number,
            });
            console.log(JSON.stringify(commits, null, 2));
            // const isTitleSemantic = isSemanticMessage(title);
            // const state = isTitleSemantic ? 'success' : 'pending';
            // const description = 'this is the description';
            // const status: ReposCreateStatusParams = {
            //   owner,
            //   repo,
            //   state,
            //   sha: head.sha,
            //   description,
            //   context: 'Conventional Pull Request',
            // };
            // const result = await octokit.repos.createStatus(status);
        }
        catch (error) {
            // core.setFailed(error.message);
            console.log('err0r!', error);
        }
    });
}
run();
