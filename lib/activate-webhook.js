// @ts-check

/**
 * @param {import("../internal").StateWithWebsocket} state
 */
export default async function activateWebhook(state) {
  const [route, extraParameters] = state.repo
    ? [
        // https://docs.github.com/en/rest/webhooks/repos#update-a-repository-webhook
        "PATCH /repos/{owner}/{repo}/hooks/{hook_id}",
        { owner: state.owner, repo: state.repo },
      ]
    : [
        // https://docs.github.com/en/rest/orgs/webhooks#update-an-organization-webhook
        "PATCH /orgs/{org}/hooks/{hook_id}",
        { org: state.owner },
      ];

  //
  const { data } = await state.octokit.request(route, {
    ...extraParameters,
    hook_id: state.hookId,
    active: true,
  });

  return data;
}
