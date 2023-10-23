// @ts-check

import { WebSocket } from "ws";

import createWebhook from "../lib/create-webhook.js";
import activateWebhook from "../lib/activate-webhook.js";

/**
 * @param {import("../internal").State} state
 */
export default async function start(state) {
  const { ws_url: webSocketUrl, id } = await createWebhook(state);

  const authentication = await state.octokit.auth();

  const ws = new WebSocket(webSocketUrl, {
    headers: {
      // @ts-expect-error - `authentication` is typed as unknown
      Authorization: `${authentication.token}`,
    },
  });

  state.ws = ws;
  state.hookId = id;

  ws.on("close", (code, reason) => {
    state.eventEmitter.emit("stop");
  });

  ws.on("error", (error) => state.eventEmitter.emit("error", error));

  ws.on("message", async (data) => {
    // sending a response within 10 seconds is required. Otherwise the webhook delivery times out from GitHub's perspective,
    // the websocket is closed and the webhook is deleted.
    ws.send(
      JSON.stringify({
        Status: 202,
        Header: {},
        Body: Buffer.from("ok", "utf-8").toString("base64"),
      }),
      /* c8 ignore next 5 */
      (error) => {
        if (error) {
          state.eventEmitter.emit("error", error);
        }
      }
    );

    const parsedData = JSON.parse(String(data));
    // payload keys seem to have been lowercased. We check for both in order to be more resilient
    // https://github.com/gr2m/github-webhook-relay/issues/4
    const bodyBase64 = parsedData.Body || parsedData.body;
    const headersRaw = parsedData.Header || parsedData.header;
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

  ws.on("open", async function open() {
    await activateWebhook({ ...state, ws, hookId: id });

    state.eventEmitter.emit("start");
  });
}
