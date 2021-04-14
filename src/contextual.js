import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import * as d3 from "d3";

// Make new shared Y.js document
const ydoc = new Y.Doc();

// Configure WebRTC provider to use signaling servers
const provider = new WebrtcProvider("contextual-test-case", ydoc, {
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

const body = d3.select("body");
const width = body.node().getBoundingClientRect().width;
const height = body.node().getBoundingClientRect().height;

// Do this every time `yarray` updates
yarray.observeDeep(() => {
  // Destructure last (x,y,scale) tuple from shared array
  var [x, y, scale] = yarray.slice(-3);

  // console.log(".", coords);

  // Add drop
  $("div").ripples("drop", x * width, y * height, scale * 42, 0.01);
});

// Configure rippling
$("div").ripples({
  resolution: 256,
  interactive: false,
});

/*
// Add automatic drop every 10 seconds
setInterval(function () {
  var x = Math.random();
  var y = Math.random();
  yarray.push([x, y, 1]);
}, 10000);
*/

// Trigger WebRTC event during cursor clicks and movements
body
  .on("click", (event) => {
    event.preventDefault();
    let x = (event.x / width).toFixed(2);
    let y = (event.y / height).toFixed(2);
    yarray.push([x, y, 1]);
  })
  .on("mousemove", (event) => {
    let x = (event.x / width).toFixed(2);
    let y = (event.y / height).toFixed(2);
    yarray.push([x, y, 1]);
  });

// Trigger WebRTC event during touch
body
  .on("touchstart", (event) => {
    event.preventDefault();
    const t = d3.pointers(event, this);
    let x = (t[0][0] / width).toFixed(2);
    let y = (t[0][1] / height).toFixed(2);
    yarray.push([x, y, 1]);
  })
  .on("touchmove", function (event) {
    const t = d3.pointers(event, this);
    let x = (t[0][0] / width).toFixed(2);
    let y = (t[0][1] / height).toFixed(2);
    yarray.push([x, y, 1]);
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
      if (amp.toFixed(2) >= 0.33) {
        yarray.push([0.5, 1, 5]);
      }
    };
  });
