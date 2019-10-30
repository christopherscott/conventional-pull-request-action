import * as core from '@actions/core';
import * as github from '@actions/github';
import { ReposCreateStatusParams } from '@octokit/rest';
import isSemanticMessage from './is-semantic-message';

/**
 * modes to support:
 *
 * - allow_squash_merge
 * - allow_merge_commit
 * - allow_rebase_merge
 */

async function run() {
  try {
    if (!process.env.GITHUB_TOKEN) throw 'GITHUB_TOKEN env var required';

    const { owner, repo } = github.context.repo;

    console.log('---------------------------------');
    console.log(JSON.stringify(github.context.repo));
    console.log('---------------------------------');

    const { title, head } = github.context!.payload!.pull_request!;
    const isTitleSemantic = isSemanticMessage(title);
    const octokit = new github.GitHub(process.env.GITHUB_TOKEN);

    const state = isTitleSemantic ? 'success' : 'pending';

    const description = 'this is the description';

    const status: ReposCreateStatusParams = {
      owner,
      repo,
      state,
      sha: head.sha,
      description,
      context: 'Conventional Pull Request',
    };

    const result = await octokit.repos.createStatus(status);
  } catch (error) {
    // core.setFailed(error.message);
    console.log('err0r!', error);
  }
}

run();
