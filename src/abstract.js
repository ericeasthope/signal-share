import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import * as d3 from "d3";

// Make new shared Y.js document
const ydoc = new Y.Doc();

// Configure WebRTC provider to use signaling servers
const provider = new WebrtcProvider("abstract-test-case", ydoc, {
  signaling: ["wss://signaling.yjs.dev", "wss://signal-share.herokuapp.com"],
});

// Initialize shared Y.js array
const yarray = ydoc.getArray("array");

// Use default synced message
provider.on("synced", (synced) => {
  // NOTE: This is only called when a different browser connects to this client
  // Windows of the same browser communicate directly with each other
  // Although this behavior might be subject to change.
  // It is better not to expect a synced event when using y-webrtc
  console.log("synced!", synced);
});

const div = d3.select("div");
const width = div.node().getBoundingClientRect().width;
const height = div.node().getBoundingClientRect().height;

// Initialize timestamp tracking variable
var timestamp = null;

// Do this every time `yarray` updates
yarray.observeDeep(() => {
  // Destructure last value from shared array
  var [val] = yarray.slice(-1);
  // console.log(".", val);

  div
    .interrupt()
    .style("background-color", d3.interpolateViridis(val))
    .transition()
    .delay(250)
    .duration(1000)
    .style("background-color", "#000");
});

/*
// Add automatic colour flash every 10 seconds
setInterval(function () {
  yarray.push([0]);
}, 10000);
*/

// Trigger WebRTC event during cursor clicks and movements
div
  .on("click", (event) => {
    event.preventDefault();
    timestamp = event.timeStamp;
    yarray.push([(event.timeStamp - timestamp) / 2000]);
  })
  .on("mousemove", (event) => {
    if (event.timeStamp - timestamp > 1000) timestamp = null;
    else {
      yarray.push([(event.timeStamp - timestamp) / 2000]);
    }
  });

// Trigger WebRTC event during touch
div
  .on("touchstart", (event) => {
    event.preventDefault();
    timestamp = event.timeStamp;
    yarray.push([(event.timeStamp - timestamp) / 2000]);
  })
  .on("touchmove", function (event) {
    if (event.timeStamp - timestamp > 1000) timestamp = null;
    else {
      yarray.push([(event.timeStamp - timestamp) / 2000]);
    }
  })
  .on("touchend", function (event) {
    timestamp = null;
  });

// Get audio input
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

      // Get maximum amplitude from buffer
      var amp = d3.max(buffer, (b, i) => {
        // Write input samples to output unchanged
        // out[i] = b;
        return Math.abs(b);
      });

      // Add drop if amplitude is above threshold
      if (amp.toFixed(2) >= 0.4) {
        yarray.push([amp.toFixed(2)]);
      }
    };
  });
