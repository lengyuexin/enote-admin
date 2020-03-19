import React, { Component } from 'react';
import { Modal, Form, Input, message } from 'antd'
import { encrypt, debounce } from '../../utils/util'
import { post, get } from '../../utils/ajax'

@Form.create()
class CreateUserModal extends Component {
    state = {
        passName: false,//用户名是否通过校验
        passPhone: false,//手机号是否通过校验
        loading: false,//注册loading
    }
    onCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    handleOk = () => {
        this.props.form.validateFields((errors, values) => {
            if (!errors) {
                const { passName, passPhone } = this.state;
                if (passName && passPhone) {
                    this.onRegister(values);
                } else {
                    message.error("注册失败，参数校验不通过");
                    return
                }
               
            }
        })
    }
    onRegister = async (values) => {
        try {

            //如果正在注册，则return，防止重复注册
            if (this.state.loading) {
                return
            }

            //开始注册-开启加载动画

            this.setState({
                loading: true
            })

            const hide = message.loading('注册中...', 0)

            const res = await post('/user/register', {
                name: values['admin-add-name'],
                password: encrypt(values['admin-add-password']),
                phone: values['admin-add-phone'],
                level: "writer"
            })


            if (res.data) {
                this.setState({
                    loading: false
                })
                hide()
                message.success('注册成功')
                this.props.reloadUsers()     //注册成功后，要刷新外面的数据
                this.onCancel()
            }
        } catch (error) {
            console.error(error)
        }
    }

    //用户名校验
    checkName = debounce(async (value) => {

        try {
            const checkResult = await get(`/user/checkName?name=${value}`)
            if (checkResult.data) {
                this.props.form.setFields({
                    'admin-add-name': {
                        value,
                        errors: [new Error('用户名已存在')]
                    }
                })
                this.setState({ passName: false })

            } else {
                this.setState({ passName: true })
            }
        } catch (error) {
            console.error(error)
        }
    })

    //手机号校验
    checkPhone = debounce(async (value) => {

        try {
            const checkResult = await get(`/user/checkPhone?phone=${value}`)
            if (checkResult.data) {
                this.props.form.setFields({
                    'admin-add-phone': {
                        value,
                        errors: [new Error('手机号已存在')]
                    }
                })
                this.setState({ passPhone: false })
            } else {
                this.setState({ passPhone: true })
            }

        } catch (error) {
            console.error(error)
        }
    })



    render() {
        const { visible } = this.props
        const { getFieldDecorator, getFieldValue } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        return (
            <Modal
                onCancel={this.onCancel}
                visible={visible}
                title='新增用户'
                centered
                onOk={this.handleOk}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={'用户名'}>
                        {getFieldDecorator('admin-add-name', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '用户名不能为空' },
                                { pattern: /^[^\s']+$/, message: '不能输入特殊字符' },
                                { min: 1, message: '用户名至少为1位' }
                            ]
                        })(
                            <Input
                                maxLength={16}
                                onChange={(e) => this.checkName(e.target.value)}
                                placeholder='请输入用户名' />
                        )}
                    </Form.Item>

                    <Form.Item label={'密码'}>
                        {getFieldDecorator('admin-add-password', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '密码不能为空' },
                                { pattern: '^[^ ]+$', message: '密码不能有空格' },
                                { min: 8, message: '密码至少为8位' },
                            ]
                        })(
                            <Input
                                maxLength={16}
                                placeholder="请输入密码"
                                autoComplete="new-password"
                                type={'password'} />
                        )}
                    </Form.Item>
                    <Form.Item label={'确认密码'}>
                        {getFieldDecorator('admin-add-confirmPassword', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '请确认密码' },
                                {
                                    validator: (rule, value, callback) => {
                                        if (value !== getFieldValue('admin-add-password')) {
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


                    <Form.Item label={'手机号'}>
                        {getFieldDecorator('admin-add-phone', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '手机号不能为空' },
                                { pattern: /^1[3456789]\d{9}$/, message: '格式错误' },
                                { min: 11, message: '手机号必须11位' }
                            ]
                        })(
                            <Input
                                maxLength={11}
                                placeholder='请输入手机号'
                                onChange={(e) => this.checkPhone(e.target.value)}
                            />

                        )}
                    </Form.Item>

                </Form>
            </Modal>
        );
    }
}

export default CreateUserModal;