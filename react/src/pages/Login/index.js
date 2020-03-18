import React, { memo, useState, useEffect } from 'react'
import './style.less'
import { isAuthenticated, } from '../../utils/session'
import LoadableComponent from '../../utils/LoadableComponent'
import { preloadingImages } from '../../utils/util'

//动态导入登录组件-注册组件-背景
const LoginForm = LoadableComponent(import('./LoginForm'))
const RegisterForm = LoadableComponent(import('./RegisterForm'))
const Background = LoadableComponent(import('../../components/Background.js'))

//获取node服务端开放的静态资源
const imgs = [
    `${process.env.REACT_APP_BASE_URL}/public/images/bg1.jpg`,
    `${process.env.REACT_APP_BASE_URL}/public/images/bg2.jpg`,
    `${process.env.REACT_APP_BASE_URL}/public/images/bg3.jpg`,
]

//背景图片地址
const bgImgUrl = `${process.env.REACT_APP_BASE_URL}/public/images/login_bg1.jpg`


function Login({ history }) {

    //控制当前展示的是登录框还是注册框
    const [curPage, setCurPage] = useState("login")

    useEffect(() => {
        // 防止用户通过浏览器的前进后退按钮来进行路由跳转
        // 当用户登陆后再通过浏览器的后退按钮回到登录页时，再点击前进按钮可以直接回到首页
        if (!!isAuthenticated()) {
            //前进一个页面
            history.go(1)   //不然他后退或者后退了直接登出
            // logout()
        }

        //图片预加载
        preloadingImages(imgs)

    }, [history])


    // 切换登录和注册的面板

    const handleToggle = () => {
        setCurPage(pre => pre === "login" ? "register" : "login")
    }


    return (
        <Background url={bgImgUrl}>
            <div className="login-container">
                <div className={`box ${curPage === 'login' ? 'active' : ''}`}>
                    <LoginForm togglePage={handleToggle} />
                </div>
                <div className={`box ${curPage === 'register' ? 'active' : ''}`}>
                    <RegisterForm togglePage={handleToggle} />
                </div>
            </div>
        </Background>
    )



}



export default memo(Login)