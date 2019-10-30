import * as core from '@actions/core';
import * as github from '@actions/github';
import { ReposCreateStatusParams } from '@octokit/rest';
import isSemanticMessage from './is-semantic-message';

function getMessage(ok, singleCommit) {
  if (!ok && singleCommit) {
    return 'Make sure your commit message is semantic';
  } else if (!ok && !singleCommit) {
    return 'Make sure your PR title is semantic';
  }

  return 'Ready to be squashed and merged';
}

async function run() {
  try {
    if (!process.env.GITHUB_TOKEN) throw 'GITHUB_TOKEN env var required';

    const { owner, repo } = github.context.repo;
    const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
    const { data } = await octokit.repos.get({ repo, owner });
    const { allow_squash_merge, allow_merge_commit, allow_rebase_merge } = data;
    const pullRequest = github.context!.payload!.pull_request!;
    const { title, head, number: pull_number } = pullRequest;
    const { data: items } = await octokit.pulls.listCommits({
      owner,
      repo,
      pull_number,
    });

    const singleCommit = items.length <= 1;
    const ok = singleCommit
      ? items.every(({ commit }) => isSemanticMessage(commit.message))
      : isSemanticMessage(title);

    const message = getMessage(ok, singleCommit);
    const status: ReposCreateStatusParams = {
      owner,
      repo,
      sha: head.sha,
      state: ok ? 'success' : 'pending',
      description: message,
      context: 'Conventional Squash Commits',
    };

    await octokit.repos.createStatus(status);
  } catch (error) {
    console.log('err0r!', error);
  }
}

run();
