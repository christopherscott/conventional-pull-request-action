"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const conventional_commit_types_1 = __importDefault(require("conventional-commit-types"));
const parse_commit_message_1 = require("parse-commit-message");
const commitTypes = Object.keys(conventional_commit_types_1.default.types);
function isSemanticMessage(message) {
    const { error, value: commits } = parse_commit_message_1.validate(message, true);
    if (error) {
        console.error(error);
        return false;
    }
    const [result] = commits;
    const { scope, type } = result.header;
    return commitTypes.includes(type);
}
exports.default = isSemanticMessage;
