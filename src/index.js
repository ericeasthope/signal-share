import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import * as d3 from "d3";

const ydoc = new Y.Doc();

const provider = new WebrtcProvider("hello-this-is-test-yes", ydoc, {
  signaling: ["wss://signaling.yjs.dev", "wss://signal-share.herokuapp.com"],
});

const amplitudeScale = d3.scaleLinear().domain([0.5, 1.0]).range([0, 1]);

console.log("hello");

navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then((stream) => {
    window.AudioContext =
      window.AudioContext || // Default
      window.webkitAudioContext || // Safari and old versions of Chrome
      false;

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(256, 1, 1);

    source.connect(processor);
    processor.connect(context.destination);

    processor.onaudioprocess = function (e) {
      var buffer = e.inputBuffer.getChannelData(0);
      var out = e.outputBuffer.getChannelData(0);

      var amp = d3.max(buffer, (b, i) => {
        // Write input samples to output unchanged
        // out[i] = b;
        return Math.abs(b);
      });

      if (amp.toFixed(2) >= 0.5) {
        yarray.push([amp.toFixed(2)]);

        d3.select("body")
          .interrupt()
          .transition()
          .style(
            "background-color",
            d3.interpolateViridis(amplitudeScale(amp.toFixed(2)))
          )
          .duration(250)
          .transition()
          .duration(1000)
          .style("background-color", "#000");
      }
    };
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
  var amp = yarray.slice(-1)[0];
  console.log(".", amp);

  d3.select("body")
    .interrupt()
    .transition()
    .style("background-color", d3.interpolateViridis(amplitudeScale(amp)))
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
