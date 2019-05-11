import React, { Component } from "react";
import { YArray } from "yjs/types/YArray";
import { WebsocketProvider } from "yjs/provider/websocket";
import { TextareaBinding } from "yjs/bindings/textarea";

export default class YjsArrayArea extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

    componentDidMount() {
        const provider = new WebsocketProvider("wss://signal-share.herokuapp.com/");
        const ydocument = provider.get("textarea");
        const type = ydocument.define("textarea", YArray);
        new TextareaBinding(type, this.refs.share);
    }

    componentDidUpdate() {
      this.draw();
    }

    draw() {
      const { audioData } = this.props;
      const canvas = this.canvas.current;
      const height = canvas.height;
      const width = canvas.width;
      const context = canvas.getContext('2d');
      let x = 0;
      const sliceWidth = (width * 1.0) / audioData.length;

      context.lineWidth = 2;
      context.strokeStyle = '#000000';
      context.clearRect(0, 0, width, height);

      context.beginPath();
      context.moveTo(0, height / 2);
      for (const item of audioData) {
        const y = (item / 255.0) * height;
        context.lineTo(x, y);
        x += sliceWidth;
      }
      context.lineTo(x, height / 2);
      context.stroke();
    }

    render() {
        return (
          <div className="YjsArrayArea">
            <textarea ref="share" value={this.props.audioData} />
            <canvas width="500" height="300" ref={this.canvas} />
          </div>
        );
    }
}
