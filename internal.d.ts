import { EventEmitter } from "node:events";

import { EventPayloadMap, Installation } from "@octokit/webhooks-types";
import { Octokit } from "@octokit/core";
import WebSocket from "ws";

import { GitHubWebHookRelay } from "./index";

export type State = {
  owner: string;
  repo: string;
  events: (keyof EventPayloadMap)[];
  eventEmitter: EventEmitter;
  octokit: Octokit;

  webhookSecret?: string;
  webSocketUrl?: string;
  hookId?: number;
  ws?: WebSocket;
};
