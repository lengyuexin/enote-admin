import React from 'react'
import { Layout } from 'antd'
import MySider from './MySider'
import MyHeader from './MyHeader'
import MyContent from './MyContent'
import { getUser, } from '../../store/actions'
import { connect, } from 'react-redux'


const { Header, Sider, Content } = Layout;


class Index extends React.PureComponent {
    //因为这些状态在不同组件中使用了，所以这里使用了状态提升（这里也可以用状态管理,为了学习这里就使用状态提升）
    state = {
        panes: [],    //网站打开的标签页列表
        activeMenu: '',  //网站活动的菜单
        theme: localStorage.getItem('theme') || 'light',   //侧边栏主题
    };


    componentDidMount() {
        this.init()
    }

    /**
     * 初始化用户信息
     */
    init = async () => {
        const name = localStorage.getItem('name')
        await this.props.getUser({ name })
    }
    _setState = (obj) => {
        this.setState(obj)
    }
    render() {
        const { collapsed, panes, activeMenu, theme } = this.state

        return (
            <Layout style={{ height: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={collapsed} theme={theme}>
                    <MySider
                        theme={theme}
                        panes={panes}
                        activeMenu={activeMenu}
                        onChangeState={this._setState} />
                </Sider>
                <Layout>
                    <Header style={{ padding: 0 }}>
                        <MyHeader
                            theme={theme}
                            collapsed={collapsed}
                            onChangeState={this._setState} />
                    </Header>
                    <Content>
                        <MyContent
                            panes={panes}
                            activeMenu={activeMenu}
                            onChangeState={this._setState} />
                    </Content>
                </Layout>
            </Layout>
        )
    }
}







//更改状态的调度方法
const mapDispatchToProps = (dispatch) => {
    return {
        getUser(user) {
            dispatch(getUser(user));
        },
    }

}
export default connect(null, mapDispatchToProps)(Index);



