import React, { PureComponent } from 'react';
import { Table, Card, Form, Input, Button, message, Icon, Row, Col, Divider, Modal, Popconfirm, } from 'antd'
import { json } from '../../utils/ajax'
import InfoModal from './InfoModal'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import CreateUserModal from './CreateUserModal'

const store = connect(
    (state) => ({ user: state.user })
)


@withRouter @store @Form.create()
class Users extends PureComponent {
    state = {
        users: [],    //用户列表
        usersLoading: false,//获取用户loading
        pagination: {
            total: 0,
            current: 1,  //前台分页是从1开始的，后台分页是从0开始的，所以要注意一下
            pageSize: 10,
            showQuickJumper: true
        },
        isShowInfoModal: false,
        userInfo: {},        //当前行的user信息
        selectedRowKeys: [],   //选择中的行keys
        isShowCreateModal: false,
        delLoading: false//删除用户loading

    }
    componentDidMount() {
        this.getUsers()
    }
    componentDidUpdate(prevProps) {
        //当修改用户信息时，重新加载
        if (this.props.user !== prevProps.user) {
            this.getUsers(this.state.pagination.current)
        }
    }
    /**
     * 虽然后台可以一次把所有数据返回给我，但是为了学习,前后台还是做了一个分页
     */
    getUsers = async (page = 1) => {
        const { pagination } = this.state
        const fields = this.props.form.getFieldsValue()
        this.setState({
            usersLoading: true,
        })
        const res = await json.get('/user/getUsers', {
            current: page - 1,
            name: fields.name || '',   //koa会把参数转换为字符串，undefined也会

        })

        this.setState({
            usersLoading: false,
            users: res.data.list,
            pagination: {
                ...pagination,
                total: res.data.total,
                current: page
            }
        })
    }
    /**
     * table分页
     */
    onTableChange = async (page) => {
        await this.setState({
            pagination: page
        })
        this.getUsers(page.current)
    }
    /**
     * 搜索函数
     */
    onSearch = () => {
        this.getUsers()
    }
    /**
     * 重置函数
     */
    onReset = () => {
        this.props.form.resetFields()
        this.getUsers()
        this.setState({
            selectedRowKeys: []
        })
        message.success('重置成功')
    }
    /**
     * 打开用户信息模特框，并初始化用户信息回显
     */
    showInfoModal = (record) => {
        this.setState({
            isShowInfoModal: true,
            userInfo: record
        })
    }
    /**
     * 关闭用户信息模态框
     */
    closeInfoModal = () => {
        this.setState({
            isShowInfoModal: false,
            userInfo: {}
        })
    }
    /**
     * 批量删除
     */
    batchDelete = () => {
        Modal.confirm({
            title: '提示',
            content: '您确定批量删除勾选内容吗？',
            onOk: async () => {

                //如果正在删除，则return，防止重复操作
                if (this.state.delLoading) {
                    return
                }

                //开始删除-开启加载动画
                this.setState({ delLoading: true })

                const hide = message.loading('删除中...', 0)
                const res = await json.post('/user/delete', {
                    ids: this.state.selectedRowKeys
                })

                this.setState({ delLoading: false })
                hide();
                if (res.data) {
                    message.success('批量删除成功');
                    this.setState({ selectedRowKeys: [] })//清空批量操作数据
                    this.getUsers();//删除后重新加载数据
                }
            }
        })
    }
    /**
     * 单条删除
     */
    singleDelete = async (record) => {

        //如果正在删除，则return，防止重复操作
        if (this.state.delLoading) {
            return
        }

        //开始删除-开启加载动画

        this.setState({
            delLoading: true
        })
        const hide = message.loading('删除中...', 0)
        const res = await json.post('/user/delete', {
            ids: [record.id]
        })

        this.setState({
            delLoading: false
        })

        hide()

        if (res.data) {
            message.success('删除成功');
            this.getUsers();//删除后重新加载数据
        }
    }


    toggleShowCreateModal = (visible) => {
        this.setState({
            isShowCreateModal: visible
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { users, usersLoading, pagination, userInfo, isShowInfoModal, selectedRowKeys, isShowCreateModal } = this.state


        const columns = [
            {
                title: '序号',
                key: 'num',
                align: 'center',
                render: (text, record, index) => {
                    let num = (pagination.current - 1) * 10 + index + 1
                    if (num < 10) {
                        num = '0' + num
                    }
                    return num
                }
            },
            {
                title: '用户名',
                dataIndex: 'name',
                align: 'center'
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                align: 'center',

            },
            {
                title: '个性签名',
                dataIndex: 'sign',
                align: 'center'
            },
            {
                title: '身份',
                dataIndex: 'level',
                align: 'center',
                render: (text) => text === "admin" ? '管理员' : '普通用户',
                filterMultiple: false,
                filters: [
                    {
                        text: 'writer',
                        value: "writer",
                    },
                    {
                        text: 'admin',
                        value: "admin",
                    },
                ],
                onFilter: (value, record) => {
                    return record.level === value
                },
            },
            {
                title: '操作',
                key: 'active',
                align: 'center',
                width: "160px",
                render: (text, record) => (
                    <div style={{ textAlign: 'left' }}>

                        <span className='my-a' onClick={() => this.showInfoModal(record)}><Icon type="edit" /> 修改</span>
                        <Popconfirm title='您确定删除当前用户吗？' onConfirm={() => this.singleDelete(record)}>
                            <span className='my-a'><Divider type='vertical' /><Icon type='delete' /> 删除</span>
                        </Popconfirm>
                    </div>
                )
            },
        ]

        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys) => this.setState({ selectedRowKeys }),
            getCheckboxProps: (record) => ({
                disabled: record.id === this.props.user.id
            })
        }
        return (
            <div style={{ padding: 24 }}>
                <Card bordered={false}>
                    <Form layout='inline' style={{ marginBottom: 16 }}>
                        <Row>
                            <Col span={6}>
                                <Form.Item label="用户名">
                                    {getFieldDecorator('name')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="用户名"
											 autoComplete="off"
                                        />
                                    )}
                                </Form.Item>
                            </Col>


                            <Col span={4}>
                                <Form.Item style={{ marginRight: 0, width: '100%' }} wrapperCol={{ span: 24 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <Button type="primary" icon='search' onClick={this.onSearch}>搜索</Button>&emsp;
                                        <Button icon="reload" onClick={this.onReset}>重置</Button>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    <div style={{ marginBottom: 16, textAlign: 'right' }}>
                        <Button type='primary' icon='plus' onClick={() => this.toggleShowCreateModal(true)}>新增</Button>&emsp;
                        <Button type='danger' icon='delete' disabled={!selectedRowKeys.length} onClick={this.batchDelete}>批量删除</Button>
                    </div>

                    <Table
                        bordered
                        rowKey='id'
                        columns={columns}
                        dataSource={users}
                        loading={usersLoading}
                        rowSelection={rowSelection}
                        pagination={pagination}
                        onChange={this.onTableChange}
                    />
                </Card>
                <InfoModal visible={isShowInfoModal} userInfo={userInfo} onCancel={this.closeInfoModal} reloadUsers={this.getUsers} />
                <CreateUserModal visible={isShowCreateModal} toggleVisible={this.toggleShowCreateModal} reloadUsers={this.getUsers} />
            </div>
        );
    }
}

export default Users