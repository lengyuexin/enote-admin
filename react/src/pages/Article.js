import React, { PureComponent } from 'react';
import { Table, Card, Form, Input, Button, message, Icon, Row, Col, Divider, Modal, Popconfirm, } from 'antd'
import { json } from '../utils/ajax'





@Form.create()
class Article extends PureComponent {
    state = {
        list: [],    //文章列表
        articlesLoading: false,//获取文章列表loading
        pagination: {
            total: 0,
            current: 1,  //前台分页是从1开始的，后台分页是从0开始的，所以要注意一下
            pageSize: 10,
            showQuickJumper: true
        },
        selectedRowKeys: [],   //选择中的行keys
        delLoading: false//删除文章的loading

    }
    componentDidMount() {
        this.getArticles()
    }
    componentDidUpdate(prevProps) {
        //当修改文章信息时，重新加载
        if (this.props.article !== prevProps.article) {
            this.getArticles(this.state.pagination.current)
        }
    }
    /**
     * 虽然后台可以一次把所有数据返回给我，但是为了学习,前后台还是做了一个分页
     */
    getArticles = async (page = 1) => {
        const { pagination } = this.state
        const fields = this.props.form.getFieldsValue()
        this.setState({
            articlesLoading: true,
        })
        const res = await json.get('/article/getArticles', {
            current: page - 1,
            title: fields.title || '',   //koa会把参数转换为字符串，undefined也会

        })

        this.setState({
            articlesLoading: false,
            list: res.data.list,
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
        this.getArticles(page.current)
    }
    /**
     * 搜索函数
     */
    onSearch = () => {
        this.getArticles()
    }
    /**
     * 重置函数
     */
    onReset = () => {
        this.props.form.resetFields()
        this.getArticles()
        this.setState({
            selectedRowKeys: []
        })
        message.success('重置成功')
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
                const res = await json.post('/article/delete', {
                    ids: this.state.selectedRowKeys
                })

                this.setState({ delLoading: false })
                hide();
                if (res.data) {
                    message.success('批量删除成功');
                    this.setState({ selectedRowKeys: [] })//清空批量操作数据
                    this.getArticles();//删除后重新加载数据
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
        const res = await json.post('/article/delete', {
            ids: [record.id]
        })

        this.setState({
            delLoading: false
        })

        hide()

        if (res.data) {
            message.success('删除成功');
            this.getArticles();//删除后重新加载数据
        }
    }

    /**
     * 文章审核-ok
     */
    passArticleOK = async (record) => {

        //如果正在审核，则return，防止重复操作
        if (this.state.delLoading) {
            return
        }

        //开始审核-开启加载动画

        this.setState({
            delLoading: true
        })
        const hide = message.loading('审核中...', 0)
        const res = await json.post('/article/passArticle', {
            state: "2",
            id: record.id
        })

        this.setState({
            delLoading: false
        })

        hide()

        if (res.data) {
            message.success('审核成功');
            this.getArticles();//审核后重新加载数据
        }
    }
    /**
     * 文章审核-驳回
     */
    passArticleNO = async (record) => {

        //如果正在审核，则return，防止重复操作
        if (this.state.delLoading) {
            return
        }

        //开始审核-开启加载动画

        this.setState({
            delLoading: true
        })
        const hide = message.loading('审核中...', 0)
        const res = await json.post('/article/passArticle', {
            state: "1",
            id: record.id
        })

        this.setState({
            delLoading: false
        })

        hide()

        if (res.data) {
            message.success('审核成功');
            this.getArticles();//审核后重新加载数据
        }
    }



    render() {
        const { getFieldDecorator } = this.props.form
        const { list, articlesLoading, pagination, selectedRowKeys, } = this.state


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
                title: '标题',
                dataIndex: 'title',
                align: 'center'
            },
            {
                title: '作者',
                dataIndex: 'author',
                align: 'center',

            },
            {
                title: 'md',
                dataIndex: 'md',
                align: 'center'
            },
            {
                title: 'html',
                dataIndex: 'html',
                align: 'center'
            },
            {
                title: '状态',
                dataIndex: 'state',
                align: 'center',
                render: (text) => {
                    if (text === "0") {
                        return '待审核'
                    } else if (text === "1") {
                        return '审核未通过'
                    } else if (text === "2") {
                        return '审核通过'
                    }
                },
                filterMultiple: false,
                filters: [
                    {
                        text: '0',
                        value: "0",
                    },
                    {
                        text: '1',
                        value: "1",
                    },
                    {
                        text: '2',
                        value: "2",
                    },
                ],
                onFilter: (value, record) => {
                    return record.state === value
                },
            },
            {
                title: '操作',
                key: 'active',
                align: 'center',
                width: "160px",
                render: (text, record) => (
                    <div style={{ textAlign: 'left' }}>

                        {
                            record.state === "0" && <Popconfirm title='是否通过审核？'
                                onCancel={() => this.passArticleNO(record)}
                                onConfirm={() => this.passArticleOK(record)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <span className='my-a'><Divider type='vertical' /><Icon type='edit' /> 审核</span>
                            </Popconfirm>
                        }




                        <Popconfirm title='您确定删除当前文章吗？' onConfirm={() => this.singleDelete(record)}>
                            <span className='my-a'><Divider type='vertical' /><Icon type='delete' /> 删除</span>
                        </Popconfirm>
                    </div>
                )
            },
        ]

        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys) => this.setState({ selectedRowKeys }),

        }
        return (
            <div style={{ padding: 24 }}>
                <Card bordered={false}>
                    <Form layout='inline' style={{ marginBottom: 16 }}>
                        <Row>
                            <Col span={6}>
                                <Form.Item label="标题">
                                    {getFieldDecorator('title')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="标题"
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
                        <Button type='danger' icon='delete' disabled={!selectedRowKeys.length} onClick={this.batchDelete}>批量删除</Button>
                    </div>

                    <Table
                        bordered
                        rowKey='id'
                        columns={columns}
                        dataSource={list}
                        loading={articlesLoading}
                        rowSelection={rowSelection}
                        pagination={pagination}
                        onChange={this.onTableChange}
                    />
                </Card>
            </div>
        );
    }
}

export default Article