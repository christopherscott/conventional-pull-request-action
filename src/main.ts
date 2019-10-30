import * as core from '@actions/core';
import * as github from '@actions/github';
import { ReposCreateStatusParams } from '@octokit/rest';
import isSemanticMessage from './is-semantic-message';

async function run() {
  try {
    if (!process.env.GITHUB_TOKEN) throw 'GITHUB_TOKEN env var required';

    const { owner, repo } = github.context.repo;
    const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
    const { data } = await octokit.repos.get({ repo, owner });
    const { allow_squash_merge, allow_merge_commit, allow_rebase_merge } = data;

    const { title, head, number } = github.context!.payload!.pull_request!;

    const commits = await octokit.pulls.listCommits({
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
  } catch (error) {
    // core.setFailed(error.message);
    console.log('err0r!', error);
  }
}

run();
