import React from 'react'
import { Form, Input, } from 'antd'
import Promptbox from '../../components/PromptBox.js'
import { encrypt } from '../../utils/util'
import { post, get } from '../../utils/ajax'
import { authenticateSuccess } from '../../utils/session'



class LoginForm extends React.Component {


    state = {
        focusItem: -1,   //当前焦点聚焦在哪一项上

    }


    /**
     * 转换面板为注册面板
     * - 重置表单数据
     * - 切换显示面板
     */
    goRegister = () => {

        this.props.form.resetFields()
        this.props.togglePage()
    }

    /**
      * 表单验证成功后的登录函数
      * 
    */
    onLogin = async (values) => {

        //判断用户名是否存在
        const checkResult = await get(`/user/checkName?name=${values.name}`);

        if (!checkResult.data) {
            this.props.form.setFields({
                name: {
                    value: values.name,
                    errors: [new Error('用户名不存在')]
                }
            })
            return
        }




        const loginResult = await post('/user/login', {
            name: values.name,
            password: encrypt(values.password)
        })


        if (loginResult.data === 0) {
            this.props.form.setFields({
                password: {
                    value: values.password,
                    errors: [new Error('用户名或密码错误')]
                },
            })
            return
        }



        window.localStorage.setItem('name', values.name)
        authenticateSuccess(loginResult.data)
        window.location.href = '/'
    }



    /**
     * 表单提交
     * - 错误校验
     * - 校验通过执行登录函数
     */
    onSubmit = () => {
        this.props.form.validateFields((errors, values) => {
            if (!errors) {
                this.onLogin(values)
            }
        });
    }





    render() {

        const { getFieldDecorator, getFieldError } = this.props.form
        const { focusItem } = this.state;



        // <Form hideRequiredMark={true}>  必选标志 小红星*

        return (
            <div>
                <h3 className="title">管理员登录</h3>
                <Form hideRequiredMark={true}>

                    {/* 用户名字段 */}
                    <Form.Item
                        help={<Promptbox info={getFieldError('name') && getFieldError('name')[0]} />}
                        style={{ marginBottom: 10 }}
                        wrapperCol={{ span: 20, pull: focusItem === 0 ? 1 : 0 }}
                        labelCol={{ span: 3, pull: focusItem === 0 ? 1 : 0 }}
                        label={<span className='iconfont icon-User' style={{ opacity: focusItem === 0 ? 1 : 0.6 }} />}
                        colon={false}>
                        {getFieldDecorator('name', {
                            validateFirst: true,
                            rules: [
                                { required: true, message: '请输入用户名' },
                                { pattern: /^[^\s']+$/, message: '不能输入特殊字符' },
                            ]
                        })(
                            <Input
                                className="myInput"
                                onFocus={() => this.setState({ focusItem: 0 })}
                                onBlur={() => this.setState({ focusItem: -1 })}
                                onPressEnter={this.onSubmit}
                                placeholder="用户名"
						autoComplete="off"
                            />
                        )}
                    </Form.Item>

                    {/* 密码字段 */}

                    <Form.Item
                        help={<Promptbox info={getFieldError('password') && getFieldError('password')[0]} />}
                        style={{ marginBottom: 60 }}
                        wrapperCol={{ span: 20, pull: focusItem === 1 ? 1 : 0 }}
                        labelCol={{ span: 3, pull: focusItem === 1 ? 1 : 0 }}
                        label={<span className='iconfont icon-suo1' style={{ opacity: focusItem === 1 ? 1 : 0.6 }} />}
                        colon={false}>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '请输入密码' }]
                        })(
                            <Input
                                className="myInput"
                                type="password"
                                onFocus={() => this.setState({ focusItem: 1 })}
                                onBlur={() => this.setState({ focusItem: -1 })}
                                onPressEnter={this.onSubmit}
                                placeholder="密码"
                            />
                        )}
                    </Form.Item>



                    {/* 注册/登录逻辑按钮 */}

                    <Form.Item>
                        <div className="btn-box">
                            <div className="loginBtn" onClick={this.onSubmit}>登录</div>
                            <div className="registerBtn" onClick={this.goRegister}>注册</div>
                        </div>
                    </Form.Item>
                </Form>
                {/* 底部展示信息 */}
                <div className="footer">欢迎登陆enote后台管理系统</div>
            </div>
        )
    }
}


export default Form.create({})(LoginForm)
//经 Form.create() 包装过的组件会自带 this.props.form 属性