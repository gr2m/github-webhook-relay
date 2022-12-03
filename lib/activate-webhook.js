// @ts-check

/**
 * @param {import("../internal").State} state
 */
export default async function activateWebhook(state) {
  // https://docs.github.com/en/rest/webhooks/repos#update-a-repository-webhook
  const { data } = await state.octokit.request(
    "PATCH /repos/{owner}/{repo}/hooks/{hook_id}",

    {
      owner: state.owner,
      repo: state.repo,
      // @ts-expect-error - id is set at this point
      hook_id: state.hookId,
      active: true,
    }
  );

  return data;
}
