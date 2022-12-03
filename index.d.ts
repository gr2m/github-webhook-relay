import { EventPayloadMap } from "@octokit/webhooks-types";

export namespace GitHubWebHookRelay {
  interface Options {
    owner: string;
    repo: string;
    events: (keyof EventPayloadMap)[];
    createHookToken: string;
    webhookSecret?: string;
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
  constructor(options: GitHubWebHookRelay.Options);
  start(): Promise<void>;
  stop(): Promise<void>;
  on: AddEventListener;
}
