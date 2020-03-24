import React from 'react'
import LoadableComponent from '../utils/LoadableComponent'

const Users = LoadableComponent(import('./Users/index'), true);
const Article = LoadableComponent(import('./Article.js'), true);
const About = LoadableComponent(import('./About'), true);
// const Excel = LoadableComponent(import('./Excel'), true);


const menu = [

    {
        name: '用户管理',
        icon: 'user',
        key: 'Users'
    },
    {
        name: '文章管理',
        icon: 'bulb',
        key: 'Article'
    },

    {
        name: '个性签名',
        icon: 'info-circle',
        key: 'About'
    },
    
]
const tabs = {
    Users: <Users />,
    About: <About />,
    Article: <Article />,
    // Excel: <Excel />,
}

export {
    menu,
    tabs
}