import React, { Component } from 'react';
import { Button } from 'antd';
import { Typography } from 'antd';
const { Title } = Typography;

export class CameraFeed extends Component {
  // Processes available devices and identifies one by the label
  async processDevices(devices) {
    this.setDevice(devices[0]);
  }

  // Handle change of camera
  async handleChange(cam) {
    this.setDevice(cam);
  }
  // Sets the active device and starts playing the feed
  async setDevice(device) {
    const { deviceId } = device;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { deviceId },
    });
    this.videoPlayer.srcObject = stream;
    this.videoPlayer.load();
    this.videoPlayer
      .play()
      .then(() => {
        console.log('Stream Started');
      })
      .catch((e) => console.error(e));
  }

  // On mount, grab the users connected devices and process them
  async componentDidMount() {
    const cameras = await navigator.mediaDevices.enumerateDevices();
    var d = this.state.devices;
    d.cams = cameras;
    this.setState({ devices: d });

    await this.processDevices(cameras);
  }

  // Handles taking a still image from the video feed on the camera
  takePhoto = () => {
    const { sendFile } = this.props;
    const context = this.canvas.getContext('2d');
    context.drawImage(this.videoPlayer, 0, 0, 680, 360);
    this.canvas.toBlob(sendFile, 'image/png');
  };
  constructor() {
    super();
    this.state = { devices: {} };
  }
  render() {
    return (
      <>
        {this.state.devices.cams ? (
          <div style={{ marginBottom: '30px' }}>
            {' '}
            <Title level={4}>Available Camera Devices </Title>{' '}
            {this.state.devices.cams.map((cam, i) => {
              return (
                <Button key={i} type="dashed" onClick={() => this.handleChange(cam)}>
                  {cam.label}
                </Button>
              );
            })}
          </div>
        ) : (
          <div>
            <Title level={4}>No Camera Devices detected.</Title>
          </div>
        )}
        <div className="c-camera-feed">
          <div className="c-camera-feed__viewer">
            <video ref={(ref) => (this.videoPlayer = ref)} width="100%" />
          </div>
          <Button type="primary" style={{ width: '100%' }} onClick={this.takePhoto}>
            Capture and Upload
          </Button>
          <div className="c-camera-feed__stage" style={{ display: 'none' }}>
            <canvas width="640" height="360" ref={(ref) => (this.canvas = ref)} />
          </div>
        </div>
      </>
    );
  }
}
