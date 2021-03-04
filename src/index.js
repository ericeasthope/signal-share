import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import * as d3 from "d3";

const ydoc = new Y.Doc();

console.log(
  navigator.mediaDevices.getUserMedia({ audio: false, video: false })
);

const provider = new WebrtcProvider("hello-this-is-test-yes", ydoc, {
  signaling: ["wss://signaling.yjs.dev", "wss://signal-share.herokuapp.com"],
});

const yarray = ydoc.getArray("array");

provider.on("synced", (synced) => {
  // NOTE: This is only called when a different browser connects to this client
  // Windows of the same browser communicate directly with each other
  // Although this behavior might be subject to change.
  // It is better not to expect a synced event when using y-webrtc
  console.log("synced!", synced);
});

yarray.observeDeep(() => {
  // console.log("yarray updated: ", yarray.toJSON());
  console.log(".");
  d3.select("body")
    .transition()
    .style("background-color", "#add8e6")
    .duration(250)
    .transition()
    .duration(1000)
    .style("background-color", "#000");
});

window.pushArray = () => {
  yarray.push([""]);
};

d3.select("body")
  .transition()
  .style("background-color", "#333")
  .duration(250)
  .transition()
  .duration(1000)
  .style("background-color", "#000");
