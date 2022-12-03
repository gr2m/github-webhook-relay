import test from "ava";

import WebhookRelay from "../index.js";

test("smoke", (t) => {
  t.true(WebhookRelay instanceof Function);

  const relay = new WebhookRelay({
    owner: "gr2m",
    repo: "github-webhooks-relay",
    events: ["issues"],
    createHookToken: "token",
  });

  t.true(relay.on instanceof Function);
  t.true(relay.start instanceof Function);
  t.true(relay.stop instanceof Function);
});
