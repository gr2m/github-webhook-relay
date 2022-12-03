// @ts-check

import { WebSocket } from "ws";

import createWebhook from "../lib/create-webhook.js";
import activateWebhook from "../lib/activate-webhook.js";

/**
 * @param {import("../internal").State} state
 */
export default async function start(state) {
  const {
    // @ts-expect-error - `ws_url` is private beta
    ws_url: webSocketUrl,
    id,
  } = await createWebhook(state);

  state.hookId = id;
  state.webSocketUrl = webSocketUrl;

  const authentication = await state.octokit.auth();
  const ws = new WebSocket(webSocketUrl, {
    headers: {
      // @ts-expect-error - `authentication` is typed as unknown
      Authorization: `${authentication.token}`,
    },
  });

  state.ws = ws;

  ws.on("open", async function open() {
    await activateWebhook(state);

    state.eventEmitter.emit("start");
  });

  ws.on("message", async (data) => {
    // sending a response within 10 seconds is required. Otherwise the webhook delivery times out from GitHub's perspective,
    // the websocket is closed and the webhook is deleted.
    ws.send(
      JSON.stringify({
        Status: 200,
        Header: {},
        Body: Buffer.from("ok", "utf-8").toString("base64"),
      }),
      (error) => {
        if (error) {
          state.eventEmitter.emit("error", error);
        }
      }
    );

    const { Body: bodyBase64, Header: headersRaw } = JSON.parse(String(data));
    const body = Buffer.from(bodyBase64, "base64").toString("utf-8");

    const headers = Object.entries(headersRaw).reduce(
      (headers, [key, value]) => {
        return {
          ...headers,
          [key.toLowerCase()]: value[0],
        };
      },
      {}
    );

    const event = {
      id: headers["x-github-delivery"],
      name: headers["x-github-event"],
      body,
      headers,
    };

    if (state.webhookSecret) {
      event.headers["x-hub-signature-256"] = headers["x-hub-signature-256"];
    }

    state.eventEmitter.emit("webhook", event);
  });

  ws.on("close", (code, reason) => {
    state.eventEmitter.emit("stop");
  });

  ws.on("error", (error) => state.eventEmitter.emit("error", error));
}
