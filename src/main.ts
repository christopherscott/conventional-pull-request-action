import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  ReposCreateStatusParams,
  PullsListCommitsResponseItem,
} from '@octokit/rest';

import isSemanticMessage from './is-semantic-message';

function commitsAreSemantic(commitItems: PullsListCommitsResponseItem[]) {
  return commitItems.every(({ commit }) => isSemanticMessage(commit.message));
}

function canMergeCommit(commitItems) {
  const ok = commitsAreSemantic(commitItems):
  const message = ok ? 'Ready to create merge commit';
  return { ok, message };
}

function createCreateStatus(
  owner: string,
  repo: string,
  sha: string,
  octokit: github.GitHub
) {
  return async (ok: boolean, message: string, context: string) => {
    const status: ReposCreateStatusParams = {
      owner,
      repo,
      sha,
      state: ok ? 'success' : 'pending',
      description: message,
      context: `Conventional Pull Request - ${context}`,
    };

    await octokit.repos.createStatus(status);
  };
}

function canSquashMerge(
  title: string,
  commitItems: PullsListCommitsResponseItem[]
) {
  const singleCommit = commitItems.length <= 1;
  const titleOk = isSemanticMessage(title);
  const commitsOk = commitsAreSemantic(commitItems);
  const ok = singleCommit ? titleOk : commitsOk;

  let message = '';

  if (ok) {
    message = 'Ready to be squashed and merged';
  } else if (!ok && singleCommit) {
    message = 'Make sure your commit is semantic';
  } else if (!ok && !singleCommit) {
    message = 'Make sure your PR title is semantic';
  }

  return { ok, message };
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
    const { data: commitItems } = await octokit.pulls.listCommits({
      owner,
      repo,
      pull_number,
    });

    const createStatus = createCreateStatus(owner, repo, head.sha, octokit);

    if (allow_squash_merge) {
      const { ok, message } = canSquashMerge(title, commitItems);
      createStatus(ok, message, 'squash merging');
    }

    if (allow_merge_commit) {
      const ok = commitsAreSemantic(commitItems);
      const message = ok
        ? 'Ready to create a merge commit or rebase and merge'
        : 'Make sure all your commits are semantic';
      const status: ReposCreateStatusParams = {
        owner,
        repo,
        sha: head.sha,
        state: ok ? 'success' : 'pending',
        description: message,
        context: 'Conventional Pull Request - squash merging',
      };

      await octokit.repos.createStatus(status);
    }

    if (allow_rebase_merge) {
    }

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
  } catch (error) {
    // core.setFailed(error.message);
    console.log('err0r!', error);
  }
}

run();
