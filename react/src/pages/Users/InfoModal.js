import React, { PureComponent } from 'react';
import { Modal, Form, Input, message } from 'antd'
import { createFormField, debounce } from '../../utils/util'
import { get, post } from '../../utils/ajax'


const form = Form.create({
    //表单回显
    mapPropsToFields({ userInfo }) {

        const { name, level, phone, sign } = userInfo;

        return createFormField({
            'admin-edit-name': name,
            'admin-edit-level': level,
            'admin-edit-phone': phone,
            'admin-edit-sign': sign,
        })
    }
})

@form
class InfoModal extends PureComponent {
    state = {
        passName: true,//用户名是否通过校验
        passPhone: true,  //手机号是否通过校验
        loading: false,//更新loading

    }


    //确认按钮处理逻辑

    handleOk = () => {
        this.props.form.validateFields((errors, values) => {
            if (!errors) {
                const { passName, passPhone } = this.state;


                if (passName && passPhone) {
                    this.onUpdate(values);
                } else {
                    message.error("修改失败，参数校验不通过");
                    return
                }
            }
        })
    }


    //更新用户信息

    onUpdate = async (values) => {
        try {

            //如果正在更新，则return，防止重复操作
            if (this.state.loading) {
                return
            }

            //开始更新-开启加载动画

            this.setState({
                loading: true
            })

            const hide = message.loading('更新中...', 0)

            const res = await post('/user/update', {
                name: values['admin-edit-name'],
                phone: values['admin-edit-phone'],
                sign: values['admin-edit-sign'],
            })

            if (res.data) {
                this.setState({
                    loading: false
                })
                hide()
                message.success('更新成功')
                this.props.reloadUsers()     //更新成功后，要刷新外面的数据
                this.props.onCancel()//关闭修改框
            }
        } catch (error) {
            console.error(error)
        }
    }

    //用户名校验
    checkName = debounce(async (value) => {

        const checkResult = await get(`/user/checkName?name=${value}`)
        if (checkResult.data) {
            this.props.form.setFields({
                'admin-edit-name': {
                    value,
                    errors: [new Error('用户名已存在')]
                }
            })
            this.setState({ passName: false })

        } else {
            this.setState({ passName: true })
        }

    



    })

    //手机号校验
    checkPhone = debounce(async (value) => {

       



        const checkResult = await get(`/user/checkPhone?phone=${value}`)
        if (checkResult.data) {
            this.props.form.setFields({
                'admin-edit-phone': {
                    value,
                    errors: [new Error('手机号已存在')]
                }
            })
            this.setState({ passPhone: false })
        } else {
            this.setState({ passPhone: true })
        }

       
      


    })



    render() {
        const { getFieldDecorator, } = this.props.form;


        const formItemLayout = {
            labelCol: {
                span: 10
            },
            wrapperCol: {
                span: 14
            },
        };



        return (
            <Modal
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                width={400}
                centered
                onOk={this.handleOk}
                // footer={<Button type='primary' onClick={this.props.onCancel}>确定</Button>}
                title='用户信息修改'>
                <Form {...formItemLayout} style={{ marginRight: 30 }}>
                    <Form.Item label={'用户名'}>
                        {getFieldDecorator('admin-edit-name', {
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

                    <Form.Item label={'手机号'}>
                        {getFieldDecorator('admin-edit-phone', {
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


                    <Form.Item label={'个签'}>
                        {getFieldDecorator('admin-edit-sign', {
                            validateFirst: true,
                        })(
                            <Input placeholder='请输入个性签名' />
                        )}
                    </Form.Item>

                    <Form.Item label={'身份'}>
                        {getFieldDecorator('admin-edit-level', {
                            validateFirst: true,
                        })(
                            <Input disabled />
                        )}
                    </Form.Item>





                </Form>

            </Modal>
        );
    }
}

export default InfoModal;