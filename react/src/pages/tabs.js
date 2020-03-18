import React from 'react'
import LoadableComponent from '../utils/LoadableComponent'

const Users = LoadableComponent(import('./Users/index'), true);
const About = LoadableComponent(import('./About'), true);


const menu = [
       
    {
        name: '用户管理',
        icon: 'user',
        key: 'Users'
    },
   
    {
        name: '关于',
        icon: 'info-circle',
        key: 'About'
    }
]

const tabs = {
    Users: <Users />,
    About: <About />,
}

export {
    menu,
    tabs
}