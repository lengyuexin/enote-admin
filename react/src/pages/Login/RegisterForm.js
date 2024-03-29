import React from 'react'
import { Form, Input, message } from 'antd'
import Promptbox from '../../components/PromptBox.js'
import { debounce, encrypt } from '../../utils/util'
import { get, post } from '../../utils/ajax'

@Form.create()
class RegisterForm extends React.Component {
    state = {
        focusItem: -1,   //当前焦点聚焦在哪一项上
        loading: false, //注册的loding
        passName: false,//用户名是否通过校验
        passPhone: false,//手机号是否通过校验
    }
    /**
     * 返回登录面板
     */
    backLogin = () => {
        this.props.form.resetFields()
        this.props.togglePage()
    }

    //执行注册逻辑
    onSubmit = () => {



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
        });
    }
    /**
     * 注册函数
     */
    onRegister = async (values) => {


        //如果正在注册，则return，防止重复注册
        if (this.state.loading) {
            return
        }

        //开始注册-开启加载动画

        this.setState({
            loading: true
        })
        const hide = message.loading('注册中...', 0)

        //请求注册接口-加密密码
        const res = await post('/user/register', {
            name: values.registerName,
            phone: values.registerPhone,
            password: encrypt(values.registerPassword),
        })
        this.setState({
            loading: false
        })
        hide()
        if (res.data) {

            message.success('注册成功');
            this.backLogin();
           
        }

    }

    /**
     * @description: 检查用户名是否重复，这里用了函数防抖（函数防抖的典型应用），防抖函数要注意this和事件对象
     * 也可以在input的失去焦点的时候验证，这时候不用函数防抖
     * @param {type} 事件对象
     * @return: 
     */


    checkName = debounce(async (value) => {

        const checkResult = await get(`/user/checkName?name=${value}`)
        if (checkResult.data) {
            this.props.form.setFields({
                registerName: {
                    value,
                    errors: [new Error('用户名已存在')]
                }
            })
            this.setState({ passName: false })

        } else {
            this.setState({ passName: true })
        }



    })


    checkPhone = debounce(async (value) => {

        const checkResult = await get(`/user/checkPhone?phone=${value}`)
        if (checkResult.data) {
            this.props.form.setFields({
                registerPhone: {
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
        const { getFieldDecorator, getFieldValue, getFieldError } = this.props.form
        const { focusItem } = this.state
        return (
            <div>
                <h3 className="title">管理员注册</h3>
                <Form hideRequiredMark>
                    <Form.Item
                        help={<Promptbox info={getFieldError('registerName') && getFieldError('registerName')[0]} />}
                        style={{ marginBottom: 2 }}
                        wrapperCol={{ span: 20, pull: focusItem === 0 ? 1 : 0 }}
                        labelCol={{ span: 3, pull: focusItem === 0 ? 1 : 0 }}
                        label={<span className='iconfont icon-User' style={{ opacity: focusItem === 0 ? 1 : 0.6 }} />}
                        colon={false}>
                        {getFieldDecorator('registerName', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '用户名不能为空' },
                                { pattern: /^[^\s']+$/, message: '不能输入特殊字符' },
                                { min: 1, message: '用户名至少为1位' },

                            ]
                        })(
                            <Input
                                maxLength={16}
                                className="myInput"
                                autoComplete="new-password"  //禁用表单自动填充(不管用？)
                                onFocus={() => this.setState({ focusItem: 0 })}
                                onBlur={() => this.setState({ focusItem: -1 })}
                                onPressEnter={this.onSubmit}
                                onChange={(e) => this.checkName(e.target.value)}
                                placeholder="用户名"
                            />
                        )}
                    </Form.Item>
                    <Form.Item
                        help={<Promptbox info={getFieldError('registerPassword') && getFieldError('registerPassword')[0]} />}
                        style={{ marginBottom: 2 }}
                        wrapperCol={{ span: 20, pull: focusItem === 1 ? 1 : 0 }}
                        labelCol={{ span: 3, pull: focusItem === 1 ? 1 : 0 }}
                        label={<span className='iconfont icon-suo1' style={{ opacity: focusItem === 1 ? 1 : 0.6 }} />}
                        colon={false}>
                        {getFieldDecorator('registerPassword', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '密码不能为空' },
                                { pattern: '^[^ ]+$', message: '密码不能有空格' },
                                { min: 8, message: '密码至少为8位' },
                            ]

                        })(
                            <Input
                                maxLength={32}
                                className="myInput"
                                type="password"
                                onFocus={() => this.setState({ focusItem: 1 })}
                                onBlur={() => this.setState({ focusItem: -1 })}
                                onPressEnter={this.onSubmit}
                                placeholder="密码"
                            />
                        )}
                    </Form.Item>
                    <Form.Item
                        help={<Promptbox info={getFieldError('confirmPassword') && getFieldError('confirmPassword')[0]} />}
                        style={{ marginBottom: 2 }}
                        wrapperCol={{ span: 20, pull: focusItem === 2 ? 1 : 0 }}
                        labelCol={{ span: 3, pull: focusItem === 2 ? 1 : 0 }}
                        label={<span className='iconfont icon-suo1' style={{ opacity: focusItem === 2 ? 1 : 0.6 }} />}
                        colon={false}>
                        {getFieldDecorator('confirmPassword', {
                            rules: [
                                { required: true, message: '请确认密码' },
                                {
                                    validator: (rule, value, callback) => {
                                        if (value && value !== getFieldValue('registerPassword')) {
                                            callback('两次输入不一致！')
                                        }
                                        callback()
                                    }
                                },
                            ]

                        })(
                            <Input
                                maxLength={32}
                                className="myInput"
                                type="password"
                                onFocus={() => this.setState({ focusItem: 2 })}
                                onBlur={() => this.setState({ focusItem: -1 })}
                                onPressEnter={this.onSubmit}
                                placeholder="确认密码"
                            />
                        )}
                    </Form.Item>


                    <Form.Item
                        help={<Promptbox info={getFieldError('registerPhone') && getFieldError('registerPhone')[0]} />}
                        style={{ marginBottom: 10 }}
                        wrapperCol={{ span: 20, pull: focusItem === 3 ? 1 : 0 }}
                        labelCol={{ span: 3, pull: focusItem === 3 ? 1 : 0 }}
                        label={<span className='iconfont icon-yanzhengmatianchong' style={{ opacity: focusItem === 3 ? 1 : 0.6 }} />}
                        colon={false}>
                        {getFieldDecorator('registerPhone', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '手机号不能为空' },
                                { pattern: /^1[3456789]\d{9}$/, message: '格式错误' },
                                { min: 11, message: '手机号必须为11位' }
                            ]
                        })(
                            <Input
                                maxLength={11}
                                className="myInput"
                                onFocus={() => this.setState({ focusItem: 3 })}
                                onBlur={() => this.setState({ focusItem: -1 })}
                                onPressEnter={this.onSubmit}
                                onChange={(e) => this.checkPhone(e.target.value)}
                                placeholder="手机号"
                            />
                        )}
                    </Form.Item>

                    <Form.Item>
                        <div className="btn-box">
                            <div className="loginBtn" onClick={this.onSubmit}>注册</div>
                            <div className="registerBtn" onClick={this.backLogin}>返回登录</div>
                        </div>
                    </Form.Item>
                </Form>
                <div className="footer">欢迎注册enote后台管理系统</div>
            </div>
        )
    }
}

export default RegisterForm