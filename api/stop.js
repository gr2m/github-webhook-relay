// @ts-check

/**
 * @param {import("../internal").State} state
 */
export default async function stop(state) {
  state.log.debug("closing websocket");

  state.ws?.close();

  state.events.emit("stop");
}
