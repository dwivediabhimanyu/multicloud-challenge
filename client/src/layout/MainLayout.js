import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import './MainLayout.less';

const { Footer } = Layout;

export default class MainLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { children } = this.props;
    return (
      <Layout>
        <Layout>
          {children}
          <Footer>
            Made by <a href="https://www.linkedin.com/in/abhimanyudwivedi/">@dvlprabhi</a> for
            ACloudGuru{' '}
            <a href="https://acloudguru.com/blog/engineering/cloudguruchallenge-multi-cloud-madness">
              Multicloud challenge{' '}
            </a>
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

MainLayout.propTypes = {
  children: PropTypes.element.isRequired,
};
