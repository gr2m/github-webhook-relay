// @ts-check

/**
 * @param {import("../internal").State} state
 */
export default async function createWebhook(state) {
  const [route, extraParameters] = state.repo
    ? [
        // https://docs.github.com/en/rest/webhooks/repos#create-a-repository-webhook
        "POST /repos/{owner}/{repo}/hooks",
        { owner: state.owner, repo: state.repo },
      ]
    : [
        // https://docs.github.com/en/rest/orgs/webhooks#create-an-organization-webhook
        "POST /orgs/{org}/hooks",
        { org: state.owner },
      ];

  const { data } = await state.octokit.request(route, {
    // The `cli` name is what flags the webhook to enable websockets and return the `ws_url` property
    name: "cli",
    events: state.events,
    config: {
      content_type: "json",
      insecure_ssl: "0",
    },
    ...extraParameters,
  });

  return data;
}
