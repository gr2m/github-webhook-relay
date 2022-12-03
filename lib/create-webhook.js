// @ts-check

/**
 * @param {import("../internal").State} state
 */
export default async function createWebhook(state) {
  // https://docs.github.com/en/rest/webhooks/repos#create-a-repository-webhook
  const { data } = await state.octokit.request(
    "POST /repos/{owner}/{repo}/hooks",
    {
      owner: state.owner,
      repo: state.repo,
      // The `cli` name is what flags the webhook to enable websockets and return the `ws_url` property
      name: "cli",
      events: state.events,
      config: {
        content_type: "json",
        insecure_ssl: "0",
      },
    }
  );

  return data;
}
