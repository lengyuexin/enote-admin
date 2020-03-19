import React from 'react'
import { Modal, Input, Form, message } from 'antd'
import { connect } from 'react-redux'
import { createFormField, encrypt } from '../../utils/util'
import { json } from '../../utils/ajax'
import { logout } from '../../utils/session'

const store = connect(
    (state) => ({ user: state.user }),
)
const form = Form.create({
    //表单回显
    mapPropsToFields({ user }) {

        return createFormField({
            'admin-edit-self-name': user.name,
        })
    }
})

@store @form
class EditPasswordModal extends React.PureComponent {

    state = {
        loading: false//修改密码loading
    }

    handleCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false);

    }
    /**
     * 模态框的确定按钮
     */
    handleOk = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.onSubmit(values)
            }
        });
    }
    /**
     * 提交修改密码
     */
    onSubmit = async (values) => {

        //如果正在修改，则return，防止重复操作
        if (this.state.loading) {
            return
        }

        //开始修改-开启加载动画
        this.setState({
            loading: true
        })

        const hide = message.loading('密码修改中...', 0)


        //请求密码修改接口
        const res = await json.post('/user/updatePwd', {
            name: values['admin-edit-self-name'],
            password: encrypt(values['admin-edit-self-password'])
        })
        this.setState({
            loading: false
        })
        hide()


        if (res.data) {
            message.success('修改成功,3s后重新登录');
            this.handleCancel();

            setTimeout(() => {
                logout();
                window.location.href = "/"
            }, 3000)


        }
    }

    render() {
        const { visible } = this.props
        const { getFieldDecorator, getFieldValue } = this.props.form

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        return (
            <Modal
                onCancel={this.handleCancel}
                onOk={this.handleOk}
                visible={visible}
                centered
                title="修改密码">
                <Form>
                    <Form.Item label={'用户名'} {...formItemLayout}>
                        {getFieldDecorator('admin-edit-self-name', {})(
                            <Input disabled />
                        )}
                    </Form.Item>

                    <Form.Item label={'新密码'} {...formItemLayout}>
                        {getFieldDecorator('admin-edit-self-password', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '密码不能为空' },
                                { pattern: '^[^ ]+$', message: '密码不能有空格' },
                                { min: 8, message: '密码至少为8位' },
                            ]
                        })(
                            <Input
                                placeholder="请输入新密码"
                                autoComplete="new-password"
                                type={'password'} />
                        )}
                    </Form.Item>
                    <Form.Item label={'确认密码'} {...formItemLayout}>
                        {getFieldDecorator('admin-edit-self-confirmPassword', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '请确认密码' },
                                {
                                    validator: (rule, value, callback) => {
                                        if (value !== getFieldValue('admin-edit-self-password')) {
                                            callback('两次输入不一致！')
                                        }
                                        callback()
                                    }
                                },
                            ]
                        })(
                            <Input
                                onPressEnter={this.handleOk}
                                placeholder="请确认密码"
                                autoComplete="new-password"
                                type={'password'} />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default EditPasswordModal