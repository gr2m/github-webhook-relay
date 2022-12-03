# `github-webhook-relay`

> **Warning**  
> Receiving webhooks via websockets is currently in [private beta](https://github.blog/changelog/2022-11-16-webhook-forwarding-in-the-github-cli-public-beta/)

A Node.js library that uses the same APIs as the [`gh webhook` plugin](https://github.com/cli/gh-webhook) for the [GitHub CLI](https://cli.github.com/).

## Usage

The `createHookToken` option needs to be set to a [token with the `admin:repo_hook` scope](https://github.com/settings/tokens/new?scopes=admin:repo_hook&description=github-webhook-relay).

```js
import WebhookRelay from "github-webhook-relay";

const relay = new WebhookRelay({
  owner: "gr2m",
  repo: "github-webhooks-relay",
  events: ["issues"],
  createHookToken: process.env.GITHUB_TOKEN,
});

relay.on("webhook", ({ id, name, payload, signature, headers }) => {
  console.log("received webhook: %s", name);
});

relay.on("error", (error) => {
  console.log("error: %s", error);
});

relay.start();
```

## API

### Constructor

```js
const relay = new WebhookRelay(options);
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>options.owner</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The account name of the GitHub user or organization.

</td>
    </tr>
    <tr>
      <th>
        <code>options.name</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. The repository name

</td>
    </tr>
    <tr>
      <th>
        <code>options.events</code>
      </th>
      <td>
        <code>string[]</code>
      </td>
      <td>

**Required**. The list of strings that the webhook should subscribe to. For a list of supported event names, see [the GitHub docs](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads).

</td>
    </tr>
    <tr>
      <th>
        <code>options.createHookToken</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. Access token to create the repository webhook. The token needs to have the `admin:repo_hook` scope. ([create a personal access token](https://github.com/settings/tokens/new?scopes=admin:repo_hook&description=github-webhook-relay)).

</td>
    </tr>
    <tr>
      <th>
        <code>options.webhookSecret</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

The secret used to sign the webhook payloads. Defaults to no secret.

</td>
    </tr>
    <tr>
      <th>
        <code>options.log</code>
      </th>
      <td>
        <code>object</code>
      </td>
      <td>

The looger to use for internal logs. An object with `{ debug, warn }` can be passed. Pass `console` to enable all logging.

Defaults to no logging.

</td>
    </tr>
  </tbody>
</table>

### `relay.on()`

```js
relay.on(eventName, callback);
```

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>eventName</code>
      </th>
      <td>
        <code>string</code>
      </td>
      <td>

**Required**. Supported events are

1. `webhook` - emitted when a webhook is received
2. `error` - emitted when an error occurs

</td>
    </tr>
    <tr>
      <th>
        <code>callback</code>
      </th>
      <td>
        <code>function</code>
      </td>
      <td>

**Required**. The event handler.

When `eventName` is `webhook`, the callback is called with an object with the following properties:

- `id` - the webhook delivery GUID
- `name` - the name of the event
- `body` - the webhook payload as string[^1]
- `signature` - the signature of the webhook payload
- `headers` - the headers of the webhook request

When `eventName` is `error`, the callback is called with an error object.

[^1]: The webhook payload is passed as is in case the signature needs to be verified again. Parsing the JSON and later stringifying it again bight result in a signature mismatch.

</td>
    </tr>
  </tbody>
</table>

### `relay.start()`

```js
relay.start();
```

Creates the repository hook and connects to the GitHub webhook forwarding service.

### `relay.stop()`

```js
relay.start();
```

Disconnects from the GitHub webhook forwarding service and deletes the repository hook.

## How it works

When creating a repository webhook using [the `POST /repos/{owner}/{repo}/hooks` endpoint](https://docs.github.com/en/rest/webhooks/repos?apiVersion=2022-11-28#create-a-repository-webhook) and you set `name` to `"cli"` then the response body will include a `ws_url` key.

You can connect to the `ws_url` using a WebSocket client. Note that the handshake request requires an `Authorization` header which will have to be set to a personal access token. Using [the `ws` npm package](https://github.com/websockets/ws#readme) the code looks like this:

```js
const ws = new WebSocket(webSocketUrl, {
  headers: {
    Authorization: process.env.GITHUB_TOKEN,
  },
});
```

Webhooks are received as message. The message is a JSON string with a `Header` and `Body` keys. The `Body` is base64 encoded.

A response has to be send back within 10s, otherwise the webhook request will be canceled and time out. No further message will be sent until a response is sent back. The response has to be a JSON string as well with the keys `Status`, `Header`, and `Body`. The `Body` value needs to be base64 encoded.

Disconnecting from the websocket will automatically delete the repository webhook.

## License

[ISC](LICENSE)
