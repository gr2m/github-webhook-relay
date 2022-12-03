// @ts-check

/**
 * @param {import("../internal").StateWithWebsocket | import("../internal").State} state
 */
export default async function stop(state) {
  state.eventEmitter.emit("stop");
  if ("ws" in state) {
    state.ws.close();
  }
}
