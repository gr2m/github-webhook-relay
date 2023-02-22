import { EventEmitter } from "node:events";

import { EventPayloadMap } from "@octokit/webhooks-types";
import { Octokit } from "@octokit/core";
import WebSocket from "ws";

import { GitHubWebHookRelay } from "./index";

export type Options =
  | GitHubWebHookRelay.OptionsWithCreateHookToken
  | GitHubWebHookRelay.OptionsWithOctokit;

export type State = {
  owner: string;
  repo?: string;
  events: (keyof EventPayloadMap)[];
  eventEmitter: EventEmitter;
  octokit: Octokit;
  webhookSecret?: string;
  hookId?: number;
  ws?: WebSocket;
};

export type StateWithWebsocket = State & {
  hookId: number;
  ws: WebSocket;
};
