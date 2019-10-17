import * as core from '@actions/core';
// @ts-ignore
import conventionalCommitTypes from 'conventional-commit-types';
import { validate } from 'parse-commit-message';
import { wait } from './wait';

const commitTypes = Object.keys(conventionalCommitTypes.types);

function isSemanticMessage(message: string) {
  const { error, value: commits } = validate(message, true);

  if (error) {
    console.error(error);
    return false;
  }

  const [result] = commits;
  const { scope, type } = result.header;
  return commitTypes.includes(type);
}

export default isSemanticMessage;
