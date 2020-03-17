import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';//全局样式初始化 reset.css
import App from './App';
 import { Router } from 'react-router-dom'
import {ConfigProvider} from 'antd'//reactUI库
import zh_CN from 'antd/es/locale/zh_CN';//antd国际化配置
import moment from 'moment';//moment时间处理库
import 'moment/locale/zh-cn';//moment国际化配置
 import history from './utils/history'
import { Provider } from 'react-redux'
import store from './store'


moment.locale('zh-cn');

ReactDOM.render(
    <Provider store={store}>
         <Router history={history}>
            <ConfigProvider locale={zh_CN}>
                <App />
            </ConfigProvider>
         </Router>
    </Provider >,
    document.getElementById('root'));

