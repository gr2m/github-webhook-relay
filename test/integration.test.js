import test from "ava";
import { Octokit } from "@octokit/core";
import { WebSocketServer } from "ws";
import getPort from "get-port";

import WebhookRelay from "../index.js";

import { issuesOpenEvent } from "./fixtures/issues.open.js";

const TestOctokit = Octokit.plugin((octokit, { t, port }) => {
  octokit.hook.wrap("request", (request, options) => {
    const route = `${options.method} ${options.url}`;
    options.headers["user-agent"] = "test";
    t.snapshot(options, route);

    return {
      data: {
        ws_url: `ws://localhost:${port}`,
        id: 1,
      },
    };
  });
}).defaults({
  auth: "secret123",
});

test("README example", async (t) => {
  return new Promise(async (resolve, reject) => {
    const port = await getPort();
    const octokit = new TestOctokit({ t, port });

    const wss = new WebSocketServer({ port });

    wss.on("connection", function connection(ws) {
      ws.on("message", (data) => {
        t.snapshot(data.toString(), "response");

        ws.close();
        wss.close();
      });

      ws.send(JSON.stringify(issuesOpenEvent));
    });

    octokit.hook.wrap("request", (request, options) => {
      const route = `${options.method} ${options.url}`;
      options.headers["user-agent"] = "test";
      t.snapshot(options, route);

      return {
        data: {
          ws_url: `ws://localhost:${port}`,
          id: 1,
        },
      };
    });

    const relay = new WebhookRelay({
      owner: "gr2m",
      repo: "github-webhooks-relay",
      events: ["issues"],
      octokit,
    });

    wss.on("error", reject);
    relay.on("error", reject);

    let startReceived;
    relay.on("start", () => (startReceived = true));
    relay.on("webhook", (event) => t.snapshot(event, "webhook"));
    relay.on("stop", () => {
      t.true(startReceived);
      resolve();
    });

    wss.on("listening", async () => {
      relay.start();
    });
  });
});

test("with secret", async (t) => {
  return new Promise(async (resolve, reject) => {
    const port = await getPort();
    const octokit = new TestOctokit({ t, port });

    const wss = new WebSocketServer({ port });

    wss.on("connection", function connection(ws) {
      ws.on("message", (data) => {
        t.snapshot(data.toString(), "response");
        relay.stop();
      });

      ws.send(JSON.stringify(issuesOpenEvent));
    });

    const relay = new WebhookRelay({
      owner: "gr2m",
      repo: "github-webhooks-relay",
      events: ["issues"],
      octokit,
      webhookSecret: "secret",
    });

    wss.on("error", reject);
    relay.on("error", reject);

    let startReceived;
    relay.on("start", () => (startReceived = true));
    relay.on("webhook", (event) => t.snapshot(event, "webhook"));
    relay.on("stop", () => {
      t.true(startReceived);
      wss.close();
      resolve();
    });

    wss.on("listening", async () => {
      relay.start();
    });
  });
});
