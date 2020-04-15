import React from 'react'
import { Modal, Form, Upload, Icon, message } from 'antd'
import { isAuthenticated } from '../../utils/session'
import { json } from '../../utils/ajax'
import { createFormField } from '../../utils/util'
import { setUser, } from '../../store/actions'
import { connect, } from 'react-redux'



const form = Form.create({
    mapPropsToFields({ user }) {
        return createFormField({
            'admin-edit-avatar': user.avatar
        })
    }

})

@form
class EditInfoModal extends React.Component {
    state = {
        uploading: false,

    }
    /**
     * 关闭模态框
     */
    handleCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    /**
     * 模态框的确定按钮
     */
    handleOk = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.onUpdate(values)
            }
        });
    }
    /**
     * 更新用户头像
     */
    onUpdate = async (values) => {

        const loginUserName=window.localStorage.getItem("name");
        

        const avatarArr = values['admin-edit-avatar'].split("/");
        const avatarName = avatarArr[avatarArr.length - 1];
        const avatarFolder = avatarArr[avatarArr.length - 2];

        const res = await json.post('/user/updateAvatar',

            {
                avatar: `/${avatarFolder}/${avatarName}`,
                name: window.localStorage.getItem("name")
            }

        )

        const res2 = await json.get( `/user/getUser?name=${loginUserName}`)

        setUser(res2.data.data)
        






        if (res.data) {
            message.success("头像更新成功")
            this.handleCancel()
            window.location.href="/"
           
        }



    }
    /**
     * 转换上传组件表单的值
     */
    _normFile = (e) => {

        if (e && e.file && e.file.response) {
            return e.file.response.data
        }

        return ''

    }
    render() {
        const { uploading } = this.state
        const { visible } = this.props
        const { getFieldDecorator, getFieldValue } = this.props.form

        const avatar = getFieldValue('admin-edit-avatar')

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }

        const uploadProps = {
            name: "admin-edit-avatar",
            multiple: false,
            listType: "picture-card",
            headers: {
                Authorization: `Bearer ${isAuthenticated()}`,
            },
            action: `${process.env.REACT_APP_BASE_URL}/upload`,
            showUploadList: false,
            accept: "image/*",
            onChange: (info) => {


                if (info.file.status !== 'uploading') {
                    this.setState({
                        uploading: true
                    })
                }
                if (info.file.status === 'done') {
                    this.setState({
                        uploading: false,
                    })
                    message.success('上传头像成功')
                } else if (info.file.status === 'error') {
                    this.setState({
                        uploading: false
                    })
                    message.error(info.file.response.message || '上传头像失败')
                }
            }
        }
        return (
            <Modal
                onCancel={this.handleCancel}
                onOk={this.handleOk}
                visible={visible}
                centered
                title="头像更换">
                <div style={{ height: '30vh', overflow: 'hidden' }}>
                    <Form>
                        <Form.Item label={'头像'} {...formItemLayout}>
                            {getFieldDecorator('admin-edit-avatar', {
                                rules: [{ required: true, message: '请上传用户头像' }],
                                getValueFromEvent: this._normFile,     //将上传的结果作为表单项的值（用normalize报错了，所以用的这个属性）
                            })(
                                <Upload   {...uploadProps} style={styles.avatarUploader}>
                                    {avatar ? <img src={`${process.env.REACT_APP_BASE_URL}${avatar}`} alt="avatar" style={styles.avatar} /> : <Icon style={styles.icon} type={uploading ? 'loading' : 'plus'} />}
                                </Upload>
                            )}
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
    }
}

const styles = {
    avatarUploader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        height: 150,
        backgroundColor: '#fff'
    },
    icon: {
        fontSize: 28,
        color: '#999'
    },
    avatar: {
        maxWidth: '100%',
        maxHeight: '100%',
    },
}






//从全局state中获取数据
const mapStateToProps = (state) => {
    return {
        user: state.user
    }

}

//更改状态的调度方法
const mapDispatchToProps = (dispatch) => {
    return {
        setUser(user) {
            dispatch(setUser(user));
        },
    }

}
export default connect(mapStateToProps, mapDispatchToProps)(EditInfoModal);



