import React, { Component } from "react";
import YjsTextArea from "./YjsTextArea";
import AudioAnalyser from './AudioAnalyser';
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audio: null
    };
    this.toggleMicrophone = this.toggleMicrophone.bind(this);
  }

  componentDidMount() {
    this.toggleMicrophone();
  }

  async getMicrophone() {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    this.setState({ audio });
  }

  stopMicrophone() {
    this.state.audio.getTracks().forEach(track => track.stop());
    this.setState({ audio: null });
  }

  toggleMicrophone() {
    if (this.state.audio) {
      this.stopMicrophone();
    } else {
      this.getMicrophone();
    }
  }

  render() {
    return (
      <div className="App">
        {this.state.audio ? <AudioAnalyser audio={this.state.audio} /> : ''}

        <h1>.</h1>
        <YjsTextArea />
        <p>The text areas are synchronized between hosts.</p>
      </div>
    );
  }
}

export default App;
