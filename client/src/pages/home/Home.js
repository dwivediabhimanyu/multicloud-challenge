import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactJsonPrint from 'react-json-print';
import PropTypes from 'prop-types';

import { Row, Col, Divider, Typography, Spin } from 'antd';
import { Button } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
const { Paragraph, Text } = Typography;

import PageLayout from '../../layout/PageLayout';
import { CameraFeed } from './CameraFeed';
const { ENDPOINT } = require('../../../../config');

const Home = ({ location: { pathname } }) => {
  const [load, setLoading] = useState({ loaded: false, captured: false });
  const [imageUploadResponse, setUploadImageResponse] = useState({});
  const [imageData, setImageData] = useState({});
  let message;

  // Sets message based on current state
  if (load.captured) {
    message = (
      <>
        <Divider orientation="left">
          <Spin /> Please Wait..
        </Divider>

        <Paragraph>
          The image was captured and uploaded to the server for processing. Average Processing time
          - 40 seconds...
        </Paragraph>
      </>
    );
  } else {
    message = (
      <>
        <Divider orientation="left">Instructions</Divider>
        <Paragraph>
          Point camera towards the object you want to identify. Click 'Capture and Upload' button.
          Wait until the image is processed by the server. It may take up to a minute for the
          process to finish. Resulting JSON will be shown in the Data object below. You can click
          the ‘Download Image’ button to download the captured image and ‘Copy JSON to clipboard’
          button to copy the result to clipboard.{' '}
        </Paragraph>
        <Text mark>
          Warning: Images are stored publicly. Please refrain from capturing sensitive information.{' '}
        </Text>
      </>
    );
  }

  if (pathname !== '/') {
    return null;
  }

  // Upload Image to S3 using REST API
  const uploadImage = async (file) => {
    setLoading({ loading: false, captured: true });
    const formData = new FormData();
    formData.append('file', file);

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      var base64data = reader.result;
      var url = ENDPOINT + 'api/';
      axios
        .post(url, {
          binImg: base64data,
        })
        .then(function (response) {
          setUploadImageResponse(response.data, () => {
            fetchDetails();
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    };
  };

  // Fetch details from Firestore using REST API
  const fetchDetails = async () => {
    const url = ENDPOINT + 'api/fetch/?fileName=' + imageUploadResponse['imageName'];
    axios
      .get(url)
      .then((response) => {
        setLoading({ loaded: true, captured: false });
        setImageData(response.data);
      })
      .catch((error) => {
        setTimeout(fetchDetails, 10000);
      });
  };

  // Hook to trigger fetchDetails after uploading
  useEffect(() => {
    if (imageUploadResponse['imageName'] != undefined) {
      fetchDetails();
    }
  }, [imageUploadResponse]);

  // Download image
  const dowloadButtonHandler = () => {
    if (imageData.data === undefined) {
      console.log('No Image Captured yet.');
    } else {
      window.open(imageData.data.URL, '_blank');
    }
  };

  // Copy Json to clipboard
  const copyButtonHandler = async () => {
    if (imageData.data === undefined) {
      console.log('No Image Captured yet.');
    } else {
      navigator.clipboard.writeText(JSON.stringify(imageData.data));
    }
  };

  return (
    <PageLayout title="Image To JSON">
      <Row gutter={24}>
        <Col md={24} lg={12}>
          <CameraFeed sendFile={uploadImage} />
        </Col>
        <Col
          className="gutter-row"
          md={24}
          lg={12}
          style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        >
          {' '}
          <div>
            {message}
            <Divider orientation="left">Result JSON</Divider>
            <Button
              style={{ margin: '15px' }}
              type="primary"
              onClick={dowloadButtonHandler}
              icon={<DownloadOutlined />}
            >
              Download Image
            </Button>
            <Button
              style={{ margin: '15px' }}
              type="primary"
              onClick={copyButtonHandler}
              icon={<CopyOutlined />}
            >
              Copy JSON to Clipboard
            </Button>
            <ReactJsonPrint style={{ marginTop: '30px' }} expanded dataObject={imageData.data} />
          </div>
        </Col>
      </Row>
    </PageLayout>
  );
};

Home.propTypes = {
  location: PropTypes.object.isRequired,
};

export default Home;
