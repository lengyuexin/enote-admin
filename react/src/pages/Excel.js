import React, { PureComponent } from 'react';
import { Card, Upload, Form, Button, message, Row, Col, } from 'antd'
import { isAuthenticated } from '../utils/session'

class Excel extends PureComponent {

    render() {

        const uploadProps = {
            name: "import-user-excel",
            multiple: false,
            headers: {
                Authorization: `Bearer ${isAuthenticated()}`,
            },
            action: `${process.env.REACT_APP_BASE_URL}/uploadUsers`,
            showUploadList: false,
            onChange: (info) => {

                if (info.file.status === 'done') {
                    message.success('上传成功');
                } else if (info.file.status === 'error') {
                    message.error(info.file.response.message || '上传失败')
                }
            }
        }

        return (
            <div style={{ padding: 24 }} >
                <Card bordered={false}>
                    <Form layout='inline' style={{ marginBottom: 16 }}>
                        <Row>
                            <Col span={6}>
                                <Upload {...uploadProps}>
                                    <Button>  Click to Upload </Button>
                                </Upload>,
                        </Col>
                        </Row>
                    </Form>
                </Card>
            </div >
        );
    }
}

export default Excel