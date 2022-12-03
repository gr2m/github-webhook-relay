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
   * @param {import("./internal").Options} options
   */
  constructor(options) {
    /** @type {import("./internal").State} */
    const state = {
      owner: options.owner,
      repo: options.repo,
      webhookSecret: options.webhookSecret,
      events: options.events,
      eventEmitter: new EventEmitter(),
      octokit:
        "octokit" in options
          ? options.octokit
          : new GitHubWebHookSocketOctokit({ auth: options.createHookToken }),
    };

    this.on = state.eventEmitter.addListener.bind(state.eventEmitter);
    this.start = start.bind(null, state);
    this.stop = stop.bind(null, state);
  }
}
