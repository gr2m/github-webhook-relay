import { expectType } from "tsd";
import GitHubWebHookRelay from "./index";

export function readmeExample() {
  const relay = new GitHubWebHookRelay({
    owner: "gr2m",
    repo: "github-webhooks-relay",
    events: ["issues"],
    createHookToken: "secret123",
  });

  relay.on("webhook", ({ id, name, body, signature, headers }) => {
    expectType<string>(id);
    expectType<string>(name);
    expectType<string>(body);
    expectType<string | undefined>(signature);
    expectType<Record<string, string>>(headers);
  });

  relay.on("error", (error) => {
    expectType<Error>(error);
  });

  expectType<Promise<void>>(relay.start());
}

export function organizationRelay() {
  const relay = new GitHubWebHookRelay({
    owner: "gr2m-sandbox",
    events: ["issues"],
    createHookToken: "secret123",
  });

  relay.on("webhook", ({ id, name, body, signature, headers }) => {
    expectType<string>(id);
    expectType<string>(name);
    expectType<string>(body);
    expectType<string | undefined>(signature);
    expectType<Record<string, string>>(headers);
  });

  relay.on("error", (error) => {
    expectType<Error>(error);
  });

  expectType<Promise<void>>(relay.start());
}
