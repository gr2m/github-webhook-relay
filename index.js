// @ts-check

import { EventEmitter } from "node:events";

import { Octokit } from "@octokit/core";

import start from "./api/start.js";
import stop from "./api/stop.js";

import VERSION from "./version.js";

const GitHubWebHookSocketOctokit = Octokit.defaults({
  userAgent: `gr2m/github-webhook-relay/${VERSION}`,
});

export default class GitHubWebHookSocket {
  /**
   * @param {import(".").GitHubWebHookRelay.Options} options
   */
  constructor({ owner, repo, events, createHookToken, webhookSecret }) {
    /** @type {import("./internal").State} */
    const state = {
      owner,
      repo,
      webhookSecret,
      events,
      eventEmitter: new EventEmitter(),
      octokit: new GitHubWebHookSocketOctokit({ auth: createHookToken }),
    };

    this.on = state.eventEmitter.addListener.bind(state.eventEmitter);
    this.start = start.bind(null, state);
    this.stop = stop.bind(null, state);
  }
}
