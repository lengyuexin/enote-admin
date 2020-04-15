import React from 'react'
import screenfull from 'screenfull'
import { Icon, message, Menu, Avatar, Button } from 'antd'
import ColorPicker from '../../components/ColorPicker.js'
import { logout } from '../../utils/session'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import LoadableComponent from '../../utils/LoadableComponent'
import MyIcon from '../../components/MyIcon.js'


const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const EditInfoModal = LoadableComponent(import('./EditInfoModal'))
const EditPasswordModal = LoadableComponent(import('./EditPasswordModal'))



@withRouter
class MyHeader extends React.Component {
    constructor(props) {


        super(props);

        const userTheme = JSON.parse(localStorage.getItem('user-theme'))
        let color = '#13C2C2'
        if (userTheme) {
            window.less.modifyVars(userTheme)
            color = userTheme['@primary-color']
        }
        this.state = {

            url: "",//bgmusic
            isFullscreen: false,    //控制页面全屏
            color: color,
            infoVisible: false,     //控制修改用户信息的模态框
            passwordVisible: false   //控制修改密码的模态框
        }

    }


    componentDidMount() {


        this.setState({
            url: this.changeMusic()
        })
    }

    changeMusic = () => {
        const musicList = ['All the Places', 'Dark Side', 'Dream It Possible', 'I Need You', 'Miracle', 'Such a Fool']
        const index = parseInt(Math.random() * 6)
        return ` http://lengyuexin-enote.gitee.io/song/music/${musicList[index]}.m4a`
    }


    /**
     * 切换侧边栏的折叠和展开
     */
    toggleCollapsed = () => {
        this.props.onChangeState({
            collapsed: !this.props.collapsed
        })
    }
    /**
     * 切换全屏
     */
    toggleFullscreen = () => {
        if (screenfull.enabled) {
            screenfull.toggle().then(() => {
                this.setState({
                    isFullscreen: screenfull.isFullscreen
                })
            });
        }
    }
    /**
     * 切换主题
     */
    changeColor = (color) => {
        window.less.modifyVars({
            '@primary-color': color,
        }).then(() => {
            localStorage.setItem('user-theme', JSON.stringify({ '@primary-color': color }))
            this.setState({
                color
            })
            message.success('更换主题颜色成功')
        })
    }
    /**
     * 重置主题
     */
    resetColor = () => {
        this.changeColor('#13C2C2')
    }
    /**
     * 展开/关闭修改信息模态框
     */
    toggleInfoVisible = (visible) => {
        this.setState({
            infoVisible: visible
        })
    }
    /**
     * 展开/关闭修改密码模态框
     */
    togglePasswordVisible = (visible) => {
        this.setState({
            passwordVisible: visible
        })
    }
    /**
     * 退出登录
     */
    onLogout = () => {
        logout()   //清空cookie
        this.props.history.push('/login')
    }
    changeTheme = () => {
        const theme = this.props.theme === 'dark' ? 'light' : 'dark'
        localStorage.setItem('theme', theme)
        this.props.onChangeState({
            theme
        })
    }

    render() {
        const { isFullscreen, color, infoVisible, passwordVisible } = this.state
        const { user, theme } = this.props



        return (
            <div style={{ background: '#fff', padding: '0 16px' }}>
                <Icon style={{ fontSize: 18, visibility: "hidden" }} type="step-forward" />

                <Button type="primary" onClick={() => {

                    const dom = document.getElementById("enote-admin-play")

                    dom.pause();

                    this.setState({
                        url: this.changeMusic()
                    }, () => {
                        dom.play();
                    })

                }}>change</Button>

                <Button style={{ marginLeft: "16px" }} onClick={() => {

                    const dom = document.getElementById("enote-admin-play")
                    if (dom.paused) {
                        dom.play();
                    } else {
                        dom.pause();
                    }

                }}>on/off</Button>

                <Button type="link" style={{ marginLeft: "16px" }}>
                    <a href={this.state.url} download={this.state.url.split("/").pop()}>download-music</a>
                </Button>

                <audio id='enote-admin-play' autoPlay loop src={this.state.url} />



                <div style={styles.headerRight}>
                    <div style={styles.headerItem}>
                        <ColorPicker color={color} onChange={this.changeColor} />
                    </div>
                    <div style={styles.headerItem}>
                        <MyIcon type={theme === 'dark' ? 'icon-yueliang1' : 'icon-taiyang'} style={{ fontSize: 24 }} onClick={this.changeTheme} />
                    </div>
                    <div style={styles.headerItem}>
                        <Menu mode="horizontal" selectable={false}>
                            <SubMenu title={<div style={styles.avatarBox}><Avatar size='small' src={`${process.env.REACT_APP_BASE_URL}${user.avatar}`} />&nbsp;<span>{user.name}</span></div>}>
                                <MenuItemGroup title="用户中心">
                                    <Menu.Item key={1} onClick={() => this.toggleInfoVisible(true)}><Icon type="user" />更换头像</Menu.Item>
                                    <Menu.Item key={77} onClick={() => this.togglePasswordVisible(true)}><Icon type="edit" />修改密码</Menu.Item>
                                    <Menu.Item key={2} onClick={this.onLogout}><Icon type="logout" />退出登录</Menu.Item>
                                </MenuItemGroup>
                                <MenuItemGroup title="设置中心">
                                    <Menu.Item key={3} onClick={this.toggleFullscreen}><Icon type={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} />切换全屏</Menu.Item>
                                    <Menu.Item key={4} onClick={this.resetColor}><Icon type="ant-design" />恢复默认主题</Menu.Item>
                                </MenuItemGroup>
                            </SubMenu>
                        </Menu>
                    </div>
                </div>
                <EditInfoModal toggleVisible={this.toggleInfoVisible} visible={infoVisible} />
                <EditPasswordModal toggleVisible={this.togglePasswordVisible} visible={passwordVisible} />
            </div>
        )
    }
}

const styles = {
    headerRight: {
        float: 'right',
        display: 'flex',
        height: 64,
        marginRight: 50
    },
    headerItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px'
    },
    avatarBox: {
        display: 'flex',
        alignItems: 'center',
    }
}



//从全局state中获取数据
const mapStateToProps = (state) => {

    return {
        user: state.user
    }

}

export default connect(mapStateToProps, null)(MyHeader)

