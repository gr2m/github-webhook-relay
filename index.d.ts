import { EventPayloadMap } from "@octokit/webhooks-types";
import { Octokit } from "@octokit/core";

export namespace GitHubWebHookRelay {
  interface Options {
    owner: string;
    repo?: string;
    // TODO: events should be set depending on whether the `repo` is set.
    // If `repo` is set, the events should be limited to the events that have the `.repository` key in their payload
    // If `repo` is not set, the events should be limited to the events that have the `.organization` key in their payload
    events: (keyof EventPayloadMap)[];
    webhookSecret?: string;
  }

  interface OptionsWithCreateHookToken extends GitHubWebHookRelay.Options {
    createHookToken: string;
  }
  interface OptionsWithOctokit extends GitHubWebHookRelay.Options {
    octokit: Octokit;
  }
}

type WebhookEvent = {
  /** GitHub Wekhook Delivery GUID */
  id: string;
  /**
   * GitHub Wekhook event name
   *
   * @example "issues"
   * @see https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads
   */
  name: string;
  /**
   * GitHub Wekhook event payload as JSON string.
   *
   * The webhook payload is passed as is in case the signature needs to be verified again. Parsing the JSON and later stringifying it again bight result in a signature mismatch.
   */
  body: string;
  /**
   * Headers of the GitHub Wekhook request.
   */
  headers: Record<string, string>;
  /**
   * If a `webhookSecret` was provide, the signature will be set sha-256 digest of the payload and the secret.
   */
  signature?: string;
};

interface AddEventListener {
  (eventName: "start", listener: () => unknown): void;
  (eventName: "stop", listener: () => unknown): void;
  (eventName: "error", listener: (error: Error) => unknown): void;
  (eventName: "webhook", listener: (event: WebhookEvent) => unknown): void;
}

export default class GitHubWebHookRelay {
  constructor(
    options:
      | GitHubWebHookRelay.OptionsWithCreateHookToken
      | GitHubWebHookRelay.OptionsWithOctokit
  );
  start(): Promise<void>;
  stop(): Promise<void>;
  on: AddEventListener;
}
